/*
 * Copyright 2018 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package za.co.absa.hyperdrive.trigger.scheduler.sensors

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.models.{AbsaKafkaSensorProperties, KafkaSensorProperties, RecurringSensorProperties, SensorProperties, TimeSensorProperties}
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, SensorRepository}
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor
import za.co.absa.hyperdrive.trigger.scheduler.sensors.kafka.{AbsaKafkaSensor, KafkaSensor}
import za.co.absa.hyperdrive.trigger.scheduler.sensors.recurring.RecurringSensor
import za.co.absa.hyperdrive.trigger.scheduler.sensors.time.{TimeSensor, TimeSensorQuartzSchedulerManager}
import za.co.absa.hyperdrive.trigger.scheduler.utilities.SensorsConfig
import za.co.absa.hyperdrive.trigger.models.{Sensor => SensorDefition}

import java.util.concurrent.Executors
import javax.inject.Inject
import scala.collection.mutable
import scala.concurrent.{ExecutionContext, ExecutionContextExecutor, Future}
import scala.util.{Failure, Success, Try}

@Component
class Sensors @Inject()(eventProcessor: EventProcessor, sensorRepository: SensorRepository, dagInstanceRepository: DagInstanceRepository) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  private implicit val executionContext: ExecutionContextExecutor =
    ExecutionContext.fromExecutor(Executors.newFixedThreadPool(SensorsConfig.getThreadPoolSize))

  private val sensors: mutable.Map[Long, Sensor[ _<: SensorProperties]] = mutable.Map.empty[Long, Sensor[ _<: SensorProperties]]

  def processEvents(assignedWorkflowIds: Seq[Long], firstIteration: Boolean): Future[Unit] = {
    logger.debug(s"Processing events. Sensors: ${sensors.keys}")
    removeReleasedSensors(assignedWorkflowIds)
    val fut = for {
      _ <- removeInactiveSensors()
      _ <- updateChangedSensors()
      _ <- addNewSensors(assignedWorkflowIds, firstIteration)
      _ <- pollEvents()
    } yield {
      (): Unit
    }

    fut.onComplete {
      case Success(_) => logger.debug("Processing events successful")
      case Failure(exception) => {
        logger.debug("Processing events failed.", exception)
      }
    }

    fut
  }

  def prepareSensors(): Unit = {
    logger.info("Preparing sensors")
    TimeSensorQuartzSchedulerManager.start()
  }

  def cleanUpSensors(): Unit = {
    logger.info("Cleaning up sensors")
    sensors.values.foreach(_.close())
    sensors.clear()

    TimeSensorQuartzSchedulerManager.stop()
  }

  private def updateChangedSensors(): Future[Unit] = {
    val kafkaSensorConsumeFromLatest = false // by construction, this query never returns sensor that changed its
    // activation state, therefore the consumer never has to consume from the latest
    sensorRepository.getChangedSensors(sensors.values.map( sensor => (sensor.sensorDefinition.id, sensor.sensorDefinition.properties)).toSeq).map(
      _.foreach { sensor =>
        stopSensor(sensor.id)
        startSensor(sensor, kafkaSensorConsumeFromLatest)
      }
    )
  }

  private def removeReleasedSensors(assignedWorkflowIds: Seq[Long]): Unit = {
    val releasedWorkflowIds = sensors.values.map(_.sensorDefinition.workflowId).toSeq.diff(assignedWorkflowIds)
    sensors.filter { case (_, value) => releasedWorkflowIds.contains(value.sensorDefinition.workflowId) }
      .foreach { case (sensorId, _) => stopSensor(sensorId) }
  }

  private def removeInactiveSensors(): Future[Unit] = {
    val activeSensors = sensors.keys.toSeq
    sensorRepository.getInactiveSensors(activeSensors).map(
      _.foreach(id => stopSensor(id))
    )
  }

  private def stopSensor(id: Long) = {
    sensors.get(id).foreach(_.close())
    sensors.remove(id)
  }

  private def addNewSensors(assignedWorkflowIds: Seq[Long], firstIteration: Boolean): Future[Unit] = {
    val activeSensors = sensors.keys.toSeq
    sensorRepository.getNewActiveAssignedSensors(activeSensors, assignedWorkflowIds).map {
      _.foreach(sensor => startSensor(sensor, kafkaSensorConsumeFromLatest = !firstIteration))
    }
  }

  private def startSensor(sensor: SensorDefition[_ <: SensorProperties], kafkaSensorConsumeFromLatest: Boolean) = {
    sensor.properties match {
      case kafkaSensorProperties: KafkaSensorProperties =>
        Try(
          new KafkaSensor(
            eventProcessor.eventProcessor(s"Sensor - ${sensor.properties.sensorType.name}"),
            sensor.copy(properties = kafkaSensorProperties),
            kafkaSensorConsumeFromLatest,
            executionContext
          )
        ) match {
          case Success(s) => sensors.put(sensor.id, s)
          case Failure(f) => logger.error(s"Could not create Kafka sensor for sensor (#${sensor.id}).", f)
        }
      case absaKafkaSensorProperties: AbsaKafkaSensorProperties =>
        Try(
          new AbsaKafkaSensor(
            eventProcessor.eventProcessor(s"Sensor - ${sensor.properties.sensorType.name}"),
            sensor.copy(properties = absaKafkaSensorProperties),
            kafkaSensorConsumeFromLatest,
            executionContext
          )
        ) match {
          case Success(s) => sensors.put(sensor.id, s)
          case Failure(f) => logger.error(s"Could not create Absa Kafka sensor for sensor (#${sensor.id}).", f)
        }
      case timeSensorProperties: TimeSensorProperties =>
        Try(
          TimeSensor(
            eventProcessor.eventProcessor(s"Sensor - ${sensor.properties.sensorType.name}"),
            sensor.copy(properties = timeSensorProperties),
            executionContext
          )
        ) match {
          case Success(s) => sensors.put(sensor.id, s)
          case Failure(f) => logger.error(s"Could not create Time sensor for sensor (#${sensor.id}).", f)
        }
      case recurringSensorProperties: RecurringSensorProperties =>
        Try(
          new RecurringSensor(
            eventProcessor.eventProcessor(s"Sensor - ${sensor.properties.sensorType.name}"),
            sensor.copy(properties = recurringSensorProperties),
            executionContext,
            dagInstanceRepository
          )
        ) match {
          case Success(s) => sensors.put(sensor.id, s)
          case Failure(f) => logger.error(s"Could not create Recurring sensor for sensor (#${sensor.id}).", f)
        }
      case _ =>
        logger.error(s"Could not find sensor implementation (#${sensor.id}).", sensor.properties.sensorType)
    }
  }

  private def pollEvents(): Future[Seq[Unit]] = {
    Future.sequence(sensors.flatMap {
      case (_, sensor: PollSensor[_]) => Option(sensor.poll())
      case _ => None
    }.toSeq)
  }

}
