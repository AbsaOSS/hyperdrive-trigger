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
import za.co.absa.hyperdrive.trigger.configuration.application.{
  GeneralConfig,
  KafkaConfig,
  RecurringSensorConfig,
  SchedulerConfig
}
import za.co.absa.hyperdrive.trigger.models.{
  AbsaKafkaSensorProperties,
  KafkaSensorProperties,
  RecurringSensorProperties,
  SensorProperties,
  TimeSensorProperties
}
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, SensorRepository}
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor
import za.co.absa.hyperdrive.trigger.scheduler.sensors.kafka.{AbsaKafkaSensor, KafkaSensor}
import za.co.absa.hyperdrive.trigger.scheduler.sensors.recurring.RecurringSensor
import za.co.absa.hyperdrive.trigger.scheduler.sensors.time.{TimeSensor, TimeSensorQuartzSchedulerManager}
import za.co.absa.hyperdrive.trigger.models.{Sensor => SensorDefition}
import za.co.absa.hyperdrive.trigger.scheduler.utilities.logging.{LazyToStr, wireTap}

import java.util.concurrent.Executors
import javax.inject.Inject
import scala.collection.mutable
import scala.concurrent.{ExecutionContext, ExecutionContextExecutor, Future}
import scala.util.{Failure, Success, Try}

@Component
class Sensors @Inject() (
  eventProcessor: EventProcessor,
  sensorRepository: SensorRepository,
  dagInstanceRepository: DagInstanceRepository,
  implicit val kafkaConfig: KafkaConfig,
  implicit val generalConfig: GeneralConfig,
  schedulerConfig: SchedulerConfig,
  implicit val recurringSensorConfig: RecurringSensorConfig
) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  private implicit val executionContext: ExecutionContextExecutor =
    ExecutionContext.fromExecutor(Executors.newFixedThreadPool(schedulerConfig.sensors.threadPoolSize))

  private val sensors: mutable.Map[Long, Sensor[_ <: SensorProperties]] =
    mutable.Map.empty[Long, Sensor[_ <: SensorProperties]]

  def processEvents(assignedWorkflowIds: Seq[Long]): Future[Unit] = {
    logger.info("Processing events sensed by %s", new LazyToStr(sensors.keys.map(id => s"SensorId=$id")))
    removeReleasedSensors(assignedWorkflowIds)
    val fut = for {
      _ <- removeInactiveSensors()
      _ <- updateChangedSensors()
      _ <- addNewSensors(assignedWorkflowIds)
      _ <- pollEvents()
    } yield {
      (): Unit
    }

    fut.onComplete {
      case Success(_)         => logger.info("Processing events successful")
      case Failure(exception) => logger.warn("Processing events failed.", exception)
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
    sensorRepository
      .getChangedSensors(
        sensors.values.map(sensor => (sensor.sensorDefinition.id, sensor.sensorDefinition.properties)).toSeq
      )
      .map(_.foreach { sensor =>
        logger.trace("Restarting updated sensor (SensorId=%d) for (WorkflowId=%d)", sensor.id, sensor.workflowId)
        stopSensor(sensor.id)
        startSensor(sensor)
      })
  }

  private def removeReleasedSensors(assignedWorkflowIds: Seq[Long]): Unit = {
    val releasedWorkflowIds = sensors.values.map(_.sensorDefinition.workflowId).toSeq.diff(assignedWorkflowIds)
    logger.trace(
      "Removing released sensors (AssignedWorkflowIds=%s; ReleasedWorkflowIds=%s)",
      assignedWorkflowIds,
      releasedWorkflowIds
    )
    sensors
      .filter { case (_, value) => releasedWorkflowIds.contains(value.sensorDefinition.workflowId) }
      .foreach { case (sensorId, _) => stopSensor(sensorId) }
  }

  private def removeInactiveSensors(): Future[Unit] = {
    val activeSensors = sensors.keys.toSeq
    logger.trace(
      "Removing inactive sensors called with active sensors: %s",
      new LazyToStr(activeSensors.map(id => s"SensorId=$id"))
    )
    sensorRepository
      .getInactiveSensors(activeSensors)
      .map(
        wireTap(inactive =>
          logger.info("Removing inactive sensors %s", new LazyToStr(inactive.map(id => s"SensorId=$id")))
        )
      )
      .map(_.foreach(id => stopSensor(id)))
  }

  private def stopSensor(id: Long) = {
    logger.trace("Stopping sensor (SensorId=%d)", id)
    sensors.get(id).foreach { sensor =>
      logger.debug(
        "Stopping sensor (SensorId=%d) for (WorkflowId=%d) with (SensorType=%s)",
        id,
        sensor.sensorDefinition.workflowId,
        sensor.sensorDefinition.properties.sensorType.name
      )
      sensor.close()
    }
    sensors.remove(id)
  }

  private def addNewSensors(assignedWorkflowIds: Seq[Long]): Future[Unit] = {
    val activeSensors = sensors.keys.toSeq
    sensorRepository.getNewActiveAssignedSensors(activeSensors, assignedWorkflowIds).map {
      _.foreach(sensor => startSensor(sensor))
    }
  }

  private def startSensor(sensor: SensorDefition[_ <: SensorProperties]) = {
    logger.debug(
      "Starting sensor (SensorId=%d) for (WorkflowId=%d) with (SensorType=%s)",
      sensor.id,
      sensor.workflowId,
      sensor.properties.sensorType.name
    )
    sensor.properties match {
      case kafkaSensorProperties: KafkaSensorProperties =>
        Try(
          new KafkaSensor(
            eventProcessor.eventProcessor(s"Sensor - ${sensor.properties.sensorType.name}"),
            sensor.copy(properties = kafkaSensorProperties)
          )
        ) match {
          case Success(s) =>
            logger.info("Kafka sensor (SensorId=%d) started for workflow (WorkflowId=%d)", sensor.id, sensor.workflowId)
            sensors.put(sensor.id, s)
          case Failure(f) => logger.error(s"Could not create Kafka sensor for sensor (#${sensor.id}).", f)
        }
      case absaKafkaSensorProperties: AbsaKafkaSensorProperties =>
        Try(
          new AbsaKafkaSensor(
            eventProcessor.eventProcessor(s"Sensor - ${sensor.properties.sensorType.name}"),
            sensor.copy(properties = absaKafkaSensorProperties)
          )
        ) match {
          case Success(s) =>
            logger.info("Absa Kafka sensor (SensorId=%d) started for workflow (WorkflowId=%d)",
                        sensor.id,
                        sensor.workflowId
            )
            sensors.put(sensor.id, s)
          case Failure(f) => logger.error(s"Could not create Absa Kafka sensor for sensor (#${sensor.id}).", f)
        }
      case timeSensorProperties: TimeSensorProperties =>
        Try(
          TimeSensor(
            eventProcessor.eventProcessor(s"Sensor - ${sensor.properties.sensorType.name}"),
            sensor.copy(properties = timeSensorProperties)
          )
        ) match {
          case Success(s) =>
            logger.info("Time sensor (SensorId=%d) started for workflow (WorkflowId=%d)", sensor.id, sensor.workflowId)
            sensors.put(sensor.id, s)
          case Failure(f) => logger.error(s"Could not create Time sensor for sensor (#${sensor.id}).", f)
        }
      case recurringSensorProperties: RecurringSensorProperties =>
        Try(
          new RecurringSensor(
            eventProcessor.eventProcessor(s"Sensor - ${sensor.properties.sensorType.name}"),
            sensor.copy(properties = recurringSensorProperties),
            dagInstanceRepository
          )
        ) match {
          case Success(s) =>
            logger.info("Recurring sensor (SensorId=%d) started for workflow (WorkflowId=%d)",
                        sensor.id,
                        sensor.workflowId
            )
            sensors.put(sensor.id, s)
          case Failure(f) => logger.error(s"Could not create Recurring sensor for sensor (#${sensor.id}).", f)
        }
      case _ =>
        logger.error(s"Could not find sensor implementation (#${sensor.id}).", sensor.properties.sensorType)
    }
  }

  private def pollEvents(): Future[Seq[Unit]] = {
    logger.trace("Polling events events called")
    Future.sequence(sensors.flatMap {
      case (_, sensor: PollSensor[_]) => Option(sensor.poll())
      case _                          => None
    }.toSeq)
  }

}
