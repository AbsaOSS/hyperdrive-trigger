package za.co.absa.hyperdrive.trigger.scheduler.sensors

import java.util.concurrent.Executors

import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes
import za.co.absa.hyperdrive.trigger.persistance.SensorRepository
import za.co.absa.hyperdrive.trigger.scheduler.sensors.kafka.KafkaSensor
import za.co.absa.hyperdrive.trigger.scheduler.utilities.SensorsConfig
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor
import org.slf4j.LoggerFactory

import scala.collection.mutable
import scala.concurrent.{ExecutionContext, ExecutionContextExecutor, Future}
import scala.util.{Failure, Success}

class Sensors(eventProcessor: EventProcessor, sensorRepository: SensorRepository) {
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
          sensors.put(
            sensor.id, new KafkaSensor(eventProcessor.eventProcessor, sensor.properties, executionContext)
          )
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
