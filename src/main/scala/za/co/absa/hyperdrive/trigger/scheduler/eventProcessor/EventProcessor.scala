package za.co.absa.hyperdrive.trigger.scheduler.eventProcessor

import za.co.absa.hyperdrive.trigger.models.{Event, Properties}
import za.co.absa.hyperdrive.trigger.persistance._
import org.slf4j.LoggerFactory
import play.api.libs.json.{JsError, JsSuccess}

import scala.concurrent.{ExecutionContext, Future}

class EventProcessor(eventRepository: EventRepository, dagDefinitionRepository: DagDefinitionRepository, dagInstanceRepository: DagInstanceRepository) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  def eventProcessor(events: Seq[Event], properties: Properties)(implicit ec: ExecutionContext): Future[Boolean] = {
    val fut = processEvents(events, properties)
    logger.debug(s"Processing events. Sensor id: ${properties.sensorId}. Events: ${events.map(_.id)}" )
    fut
  }

  private def processEvents(events: Seq[Event], properties: Properties)(implicit ec: ExecutionContext): Future[Boolean] = {
    eventRepository.getExistEvents(events.map(_.sensorEventId)).flatMap { eventsIdsInDB =>
      val newEvents = events.filter(e => !eventsIdsInDB.contains(e.sensorEventId))
      val matchedEvents = newEvents.filter { event =>
        properties.matchProperties.forall { matchProperty =>
          (event.payload \ matchProperty._1).validate[String] match {
            case JsSuccess(value, _) => value == matchProperty._2
            case _: JsError => false
          }
        }
      }
      val notMatchedEvents = newEvents.filter(e => !matchedEvents.contains(e))
      dagDefinitionRepository.getJoinedDagDefinition(properties.sensorId).flatMap {
        case Some(joinedDagDefinition) =>
          val dagInstancesJoined = matchedEvents.map (event => (joinedDagDefinition.toDagInstanceJoined(), event))
          dagInstanceRepository.insertJoinedDagInstances(dagInstancesJoined, notMatchedEvents).map(_ => true)
        case None =>
          Future.successful(true)
      }
    }
  }

}
