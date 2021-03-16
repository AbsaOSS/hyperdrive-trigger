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

import java.time.LocalDateTime
import java.util.concurrent.Executors

import javax.inject.Inject
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.models.SensorWithUpdated
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, SensorRepository}
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor
import za.co.absa.hyperdrive.trigger.scheduler.sensors.kafka.KafkaSensor
import za.co.absa.hyperdrive.trigger.scheduler.sensors.recurring.RecurringSensor
import za.co.absa.hyperdrive.trigger.scheduler.sensors.time.{TimeSensor, TimeSensorQuartzSchedulerManager}
import za.co.absa.hyperdrive.trigger.scheduler.utilities.SensorsConfig

import scala.collection.mutable
import scala.concurrent.{ExecutionContext, ExecutionContextExecutor, Future}
import scala.util.{Failure, Success, Try}

@Component
class Sensors @Inject()(eventProcessor: EventProcessor, sensorRepository: SensorRepository, dagInstanceRepository: DagInstanceRepository) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  private implicit val executionContext: ExecutionContextExecutor =
    ExecutionContext.fromExecutor(Executors.newFixedThreadPool(SensorsConfig.getThreadPoolSize))

  private case class SensorInstanceWithUpdated(sensorInstance: Sensor, updated: Option[LocalDateTime])
  private val sensors: mutable.Map[Long, SensorInstanceWithUpdated] = mutable.Map.empty[Long, SensorInstanceWithUpdated]

  def processEvents(assignedWorkflowIds: Seq[Long]): Future[Unit] = {
    logger.debug(s"Processing events. Sensors: ${sensors.keys}")
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
      case Success(_) => logger.debug("Processing events successful")
      case Failure(exception) => {
        logger.debug("Processing events failed.", exception)
      }
    }

    fut
  }

  def prepareSensors(): Unit = {
    TimeSensorQuartzSchedulerManager.start()
  }

  def cleanUpSensors(): Unit = {
    sensors.values.foreach(_.sensorInstance.close())
    sensors.clear()

    TimeSensorQuartzSchedulerManager.stop()
  }

  private def updateChangedSensors(): Future[Unit] = {
    sensorRepository.getChangedSensors(
      sensors.values.map(sensor => SensorWithUpdated(sensor.sensorInstance.sensorDefinition, sensor.updated)).toSeq
    ).map { _.foreach { sensorWithUpdated =>
        stopSensor(sensorWithUpdated.sensor.id)
        startSensor(sensorWithUpdated)
      }
    }
  }

  private def removeReleasedSensors(assignedWorkflowIds: Seq[Long]): Unit = {
    val releasedWorkflowIds = sensors.values.map(_.sensorInstance.sensorDefinition.workflowId).toSeq.diff(assignedWorkflowIds)
    sensors.filter { case (_, value) => releasedWorkflowIds.contains(value.sensorInstance.sensorDefinition.workflowId) }
      .foreach { case (sensorId, _) => stopSensor(sensorId) }
  }

  private def removeInactiveSensors(): Future[Unit] = {
    val activeSensors = sensors.keys.toSeq
    sensorRepository.getInactiveSensors(activeSensors).map(
      _.foreach(id => stopSensor(id))
    )
  }

  private def stopSensor(id: Long) = {
    sensors.get(id).foreach(_.sensorInstance.close())
    sensors.remove(id)
  }

  private def addNewSensors(assignedWorkflowIds: Seq[Long]): Future[Unit] = {
    val activeSensors = sensors.keys.toSeq
    sensorRepository.getNewActiveAssignedSensors(activeSensors, assignedWorkflowIds).map {
      _.foreach(sensor => startSensor(sensor))
    }
  }

  private def startSensor(sensor: SensorWithUpdated) = sensor match {
    case SensorWithUpdated(sensor, updated) if sensor.sensorType == SensorTypes.Kafka || sensor.sensorType == SensorTypes.AbsaKafka =>
      Try(new KafkaSensor(eventProcessor.eventProcessor(s"Sensor - ${sensor.sensorType.name}"), sensor, executionContext)) match {
        case Success(s) => sensors.put(sensor.id, SensorInstanceWithUpdated(s, updated))
        case Failure(f) => logger.error(s"Couldn't create Kafka sensor for sensor (#${sensor.id}).", f)
      }
    case SensorWithUpdated(sensor, updated)  if sensor.sensorType == SensorTypes.Time =>
      Try(TimeSensor(eventProcessor.eventProcessor(s"Sensor - ${sensor.sensorType.name}"), sensor, executionContext)) match {
        case Success(s) => sensors.put(sensor.id, SensorInstanceWithUpdated(s, updated))
        case Failure(f) => logger.error(s"Couldn't create Time sensor for sensor (#${sensor.id}).", f)
      }
    case SensorWithUpdated(sensor, updated)  if sensor.sensorType == SensorTypes.Recurring =>
      Try(new RecurringSensor(eventProcessor.eventProcessor(s"Sensor - ${sensor.sensorType.name}"), sensor, executionContext, dagInstanceRepository)) match {
        case Success(s) => sensors.put(sensor.id, SensorInstanceWithUpdated(s, updated))
        case Failure(f) => logger.error(s"Couldn't create Recurring sensor for sensor (#${sensor.id}).", f)
      }
    case _ => None
  }

  private def pollEvents(): Future[Seq[Unit]] = {
    Future.sequence(sensors.values.flatMap {
      case SensorInstanceWithUpdated(sensor: PollSensor, _)=> Option(sensor.poll())
      case _ => None
    }.toSeq)
  }
}
