/*
 * Copyright 2018-2019 ABSA Group Limited
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

import java.util.concurrent.Executors

import javax.inject.Inject
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes
import za.co.absa.hyperdrive.trigger.persistance.SensorRepository
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor
import za.co.absa.hyperdrive.trigger.scheduler.sensors.kafka.KafkaSensor
import za.co.absa.hyperdrive.trigger.scheduler.sensors.time.{TimeSensor, TimeSensorQuartzSchedulerManager}
import za.co.absa.hyperdrive.trigger.scheduler.utilities.SensorsConfig

import scala.collection.mutable
import scala.concurrent.{ExecutionContext, ExecutionContextExecutor, Future}
import scala.util.{Failure, Success, Try}

@Component
class Sensors @Inject()(eventProcessor: EventProcessor, sensorRepository: SensorRepository) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  private implicit val executionContext: ExecutionContextExecutor =
    ExecutionContext.fromExecutor(Executors.newFixedThreadPool(SensorsConfig.getThreadPoolSize))

  private val sensors: mutable.Map[Long, Sensor] = mutable.Map.empty[Long, Sensor]

  def processEvents(): Future[Unit] = {
    logger.debug(s"Processing events. Sensors: ${sensors.keys}")
    val fut = for {
      _ <- removeInactiveSensors()
      _ <- addNewSensors()
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

  def stopAllSensors(): Unit = {
    sensors.values.foreach(_.close())
    sensors.clear()
  }

  private def removeInactiveSensors(): Future[Unit] = {
    val activeSensors = sensors.keys.toSeq
    sensorRepository.getInactiveSensors(activeSensors).map(
      _.foreach{
        id =>
          sensors.get(id).foreach(_.close())
          sensors.remove(id)
      }
    )
  }

  private def addNewSensors(): Future[Unit] = {
    val activeSensors = sensors.keys.toSeq
    sensorRepository.getNewActiveSensors(activeSensors).map {
      _.foreach {
        case sensor if sensor.sensorType == SensorTypes.Kafka || sensor.sensorType == SensorTypes.AbsaKafka =>

          Try(new KafkaSensor(eventProcessor.eventProcessor, sensor.properties, executionContext)) match {
            case Success(s) => sensors.put(sensor.id, s)
            case Failure(f) => logger.error(s"Couldn't create Kafka sensor for sensor (#${sensor.id}).", f)
          }
        case sensor if sensor.sensorType == SensorTypes.Time =>
          Try(TimeSensor(eventProcessor.eventProcessor, sensor.properties, executionContext)) match {
            case Success(s) => sensors.put(sensor.id, s)
            case Failure(f) => logger.error(s"Couldn't create Time sensor for sensor (#${sensor.id}).", f)
          }
        case _ => None
      }
    }
  }

  private def pollEvents(): Future[Seq[Unit]] = {
    Future.sequence(sensors.flatMap {
      case (_, sensor: PollSensor) => Option(sensor.poll())
      case _ => None
    }.toSeq)
  }

}
