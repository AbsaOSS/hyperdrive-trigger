package za.co.absa.hyperdrive.trigger.scheduler.eventProcessor

import java.time.LocalDateTime

import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.InQueue
import za.co.absa.hyperdrive.trigger.models.{Event, JobInstance, Properties}
import za.co.absa.hyperdrive.trigger.persistance.{EventRepository, JobDefinitionsRepository, JobInstanceRepository}
import org.slf4j.LoggerFactory
import play.api.libs.json.{JsError, JsSuccess}

import scala.concurrent.{ExecutionContext, Future}

class EventProcessor(eventRepository: EventRepository, jobDefinitionsRepository: JobDefinitionsRepository, jobInstanceRepository: JobInstanceRepository) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  def eventProcessor(events: Seq[Event], properties: Properties)(implicit ec: ExecutionContext): Future[Boolean] = {
    val fut = processEvents(events, properties)
    logger.debug(s"Processing events. Sensor id: ${properties.sensorId}. Events: ${events.map(_.id)}" )
    fut
  }

  private def processEvents(events: Seq[Event], properties: Properties)(implicit ec: ExecutionContext): Future[Boolean] = {
    eventRepository.getExistEvents(events.map(_.sensorEventId)).flatMap { eventsIdsInDB =>
      val newEvents = events.filter(e => !eventsIdsInDB.contains(e.sensorEventId))
      val insertEventsDBIO = eventRepository.insertEvents(newEvents)
      val matchedEvents = newEvents.filter { event =>
        properties.matchProperties.forall { matchProperty =>
          (event.payload \ matchProperty._1).validate[String] match {
            case JsSuccess(value, _) => value == matchProperty._2
            case error: JsError => false
          }
        }
      }
      jobDefinitionsRepository.getJobDefinition(properties.sensorId).flatMap {
        case Some(jobDefinition) =>
          val jobInstances = matchedEvents.map { event =>
            JobInstance(
              jobName = jobDefinition.name,
              jobDefinitionId = jobDefinition.id,
              sensorEventId = event.sensorEventId,
              jobType = jobDefinition.jobType,
              jobParameters = jobDefinition.jobParameters,
              jobStatus = InQueue,
              created = LocalDateTime.now(),
              updated = None,
              executorJobId = None
            )
          }
          jobInstanceRepository.insertJobInstances(jobInstances, insertEventsDBIO).map(_ => true)
        case None => Future.successful(true)
      }
    }
  }

}
