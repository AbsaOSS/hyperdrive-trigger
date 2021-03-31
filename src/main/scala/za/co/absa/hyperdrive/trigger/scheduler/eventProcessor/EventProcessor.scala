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

package za.co.absa.hyperdrive.trigger.scheduler.eventProcessor

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.api.rest.services.DagInstanceService
import za.co.absa.hyperdrive.trigger.models.Event
import za.co.absa.hyperdrive.trigger.persistance._
import za.co.absa.hyperdrive.trigger.scheduler.utilities.logging._

import scala.concurrent.{ExecutionContext, Future}

@Component
class EventProcessor(
  eventRepository: EventRepository,
  dagDefinitionRepository: DagDefinitionRepository,
  dagInstanceRepository: DagInstanceRepository,
  dagInstanceService: DagInstanceService
) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  def eventProcessor(
    triggeredBy: String
  )(events: Seq[Event], sensorId: Long)(implicit ec: ExecutionContext): Future[Boolean] = {
    val fut = processEvents(events, sensorId, triggeredBy)
    logger.info(s"Processing events. Sensor id: $sensorId. Events: ${events.map(_.id)}")
    fut
  }

  private def processEvents(events: Seq[Event], sensorId: Long, triggeredBy: String)(
    implicit ec: ExecutionContext
  ): Future[Boolean] = {
    logger.trace(
      "Processing events %s called on event processor for sensor (SensorId=%d), triggered by: %s",
      new LazyToStr(events.map(e => s"EventId=${e.id}")),
      sensorId,
      triggeredBy
    )
    eventRepository.getExistEvents(events.map(_.sensorEventId)).flatMap { eventsIdsInDB =>
      val newEvents = events.filter(e => !eventsIdsInDB.contains(e.sensorEventId))
      logger.trace(
        "Unprocessed events %s",
        new LazyToStr(newEvents.map(e => s"EventId=${e.id}"))
      )
      if (newEvents.nonEmpty) {
        dagDefinitionRepository.getJoinedDagDefinition(sensorId).flatMap {
          case Some(joinedDagDefinition) =>
            for {
              hasInQueueDagInstance <- dagInstanceRepository
                .hasInQueueDagInstance(joinedDagDefinition.workflowId)
                .map(
                  wireTap(inQueue =>
                    logger.trace(
                      "DAG instance for (WorkflowId=%d) produced by (SensorId=%d) already queued: [%s]",
                      joinedDagDefinition.workflowId,
                      sensorId,
                      inQueue
                    )
                  )
                )
              dagInstanceJoined <- dagInstanceService
                .createDagInstance(joinedDagDefinition, triggeredBy, hasInQueueDagInstance)
                .map(
                  wireTap(instance =>
                    logger.trace(
                      "Created Joined DAG instance %s by (SensorId=%d) for (WorkflowId=%d)",
                      instance,
                      sensorId,
                      joinedDagDefinition.workflowId
                    )
                  )
                )
              dagInstanceJoinedEvents = newEvents.map(event => (dagInstanceJoined, event))
              _ <- dagInstanceRepository.insertJoinedDagInstancesWithEvents(dagInstanceJoinedEvents)
            } yield {
              logger.info(
                "Persisted newly paired DAG instances with Events into DB by (SensorId=%d) for (WorkflowId=%d)",
                sensorId,
                joinedDagDefinition.workflowId
              )
              true
            }
          case None =>
            logger.info("No Joined DAG definition found for (SensorId=%d)", sensorId)
            Future.successful(true)
        }
      } else {
        logger.info("EventProcessor for (SensorId=%d) doesn't have any new events", sensorId)
        Future.successful(true)
      }
    }
  }

}
