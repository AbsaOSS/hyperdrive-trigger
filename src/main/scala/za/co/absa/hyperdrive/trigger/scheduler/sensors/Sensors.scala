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

import com.typesafe.scalalogging.LazyLogging
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
  TimeSensorProperties,
  Sensor => SensorDefition
}
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, SensorRepository}
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor
import za.co.absa.hyperdrive.trigger.scheduler.sensors.kafka.{AbsaKafkaSensor, KafkaSensor}
import za.co.absa.hyperdrive.trigger.scheduler.sensors.recurring.RecurringSensor
import za.co.absa.hyperdrive.trigger.scheduler.sensors.time.{TimeSensor, TimeSensorQuartzSchedulerManager}

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
) extends LazyLogging {

  private implicit val executionContext: ExecutionContextExecutor =
    ExecutionContext.fromExecutor(Executors.newFixedThreadPool(schedulerConfig.sensors.threadPoolSize))

  private val sensors: mutable.Map[Long, Sensor[_ <: SensorProperties]] =
    mutable.Map.empty[Long, Sensor[_ <: SensorProperties]]

  def processEvents(assignedWorkflowIds: Seq[Long]): Future[Unit] = {
    logger.info(s"Processing events sensed by ${sensors.keys.map(id => s"SensorId=$id")}")
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
        logger.trace("Restarting updated sensor (SensorId={}) for (WorkflowId={})", sensor.id, sensor.workflowId)
        stopSensor(sensor.id)
        startSensor(sensor)
      })
  }

  private def removeReleasedSensors(assignedWorkflowIds: Seq[Long]): Unit = {
    val releasedWorkflowIds = sensors.values.map(_.sensorDefinition.workflowId).toSeq.diff(assignedWorkflowIds)
    logger.trace(
      "Removing released sensors {} when assigned {}",
      releasedWorkflowIds.map(id => s"WorkflowId=$id"),
      assignedWorkflowIds.map(id => s"WorkflowId=$id")
    )
    sensors
      .filter { case (_, value) => releasedWorkflowIds.contains(value.sensorDefinition.workflowId) }
      .foreach { case (sensorId, _) => stopSensor(sensorId) }
  }

  private def removeInactiveSensors(): Future[Unit] = {
    val activeSensors = sensors.keys.toSeq
    logger.trace(s"Removing inactive sensors called with active sensors: ${activeSensors.map(id => s"SensorId=$id")}")
    sensorRepository
      .getInactiveSensors(activeSensors)
      .map { inactive =>
        logger.info("Removing inactive sensors {}", inactive.map(id => s"SensorId=$id"))
        inactive.foreach(id => stopSensor(id))
      }
  }

  private def stopSensor(id: Long) = {
    logger.trace("Stopping sensor (SensorId={})", id)
    sensors.get(id).foreach(_.close())
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
      "Starting sensor (SensorId={}) for (WorkflowId={}) with (SensorType={})",
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
            logger.info("Kafka sensor (SensorId={}) started for workflow (WorkflowId={})", sensor.id, sensor.workflowId)
            sensors.put(sensor.id, s)
          case Failure(f) => logger.error(s"Could not create Kafka sensor for sensor (SensorId=${sensor.id}).", f)
        }
      case absaKafkaSensorProperties: AbsaKafkaSensorProperties =>
        Try(
          new AbsaKafkaSensor(
            eventProcessor.eventProcessor(s"Sensor - ${sensor.properties.sensorType.name}"),
            sensor.copy(properties = absaKafkaSensorProperties)
          )
        ) match {
          case Success(s) =>
            logger.info(
              "Absa Kafka sensor (SensorId={}) started for workflow (WorkflowId={})",
              sensor.id,
              sensor.workflowId
            )
            sensors.put(sensor.id, s)
          case Failure(f) => logger.error(s"Could not create Absa Kafka sensor for sensor (SensorId=${sensor.id}).", f)
        }
      case timeSensorProperties: TimeSensorProperties =>
        Try(
          TimeSensor(
            eventProcessor.eventProcessor(s"Sensor - ${sensor.properties.sensorType.name}"),
            sensor.copy(properties = timeSensorProperties)
          )
        ) match {
          case Success(s) =>
            logger.info("Time sensor (SensorId={}) started for workflow (WorkflowId={})", sensor.id, sensor.workflowId)
            sensors.put(sensor.id, s)
          case Failure(f) => logger.error(s"Could not create Time sensor for sensor (SensorId=${sensor.id}).", f)
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
            logger.info(
              "Recurring sensor (SensorId={}) started for workflow (WorkflowId={})",
              sensor.id,
              sensor.workflowId
            )
            sensors.put(sensor.id, s)
          case Failure(f) => logger.error(s"Could not create Recurring sensor for sensor (SensorId=${sensor.id}).", f)
        }
      case _ =>
        logger.error(
          "Could not find sensor implementation (SensorId={}) unknown (SensorType={})",
          sensor.id,
          sensor.properties.sensorType
        )
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
