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

package za.co.absa.hyperdrive.trigger.scheduler.sensors.recurring

import java.time.format.DateTimeFormatter
import java.time.{Instant, LocalDateTime}
import org.slf4j.LoggerFactory
import play.api.libs.json.JsObject
import za.co.absa.hyperdrive.trigger.configuration.application.RecurringSensorConfig
import za.co.absa.hyperdrive.trigger.models.{Event, RecurringSensorProperties}
import za.co.absa.hyperdrive.trigger.persistance.DagInstanceRepository
import za.co.absa.hyperdrive.trigger.scheduler.sensors.PollSensor
import za.co.absa.hyperdrive.trigger.models.{Sensor => SensorDefition}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

class RecurringSensor(
  eventsProcessor: (Seq[Event], Long) => Future[Boolean],
  sensorDefinition: SensorDefition[RecurringSensorProperties],
  dagInstanceRepository: DagInstanceRepository
)(implicit recurringSensorConfig: RecurringSensorConfig, executionContext: ExecutionContext)
    extends PollSensor[RecurringSensorProperties](eventsProcessor, sensorDefinition, executionContext) {
  private val eventDateFormatter: DateTimeFormatter = DateTimeFormatter.ISO_INSTANT
  private val logger = LoggerFactory.getLogger(this.getClass)

  override def poll(): Future[Unit] = {
    logger.debug("(SensorId=%d). Polling new events.", sensorDefinition.id)

    val fut =
      dagInstanceRepository.hasRunningDagInstance(sensorDefinition.workflowId).flatMap { hasRunningDagInstance =>
        if (hasRunningDagInstance) {
          logger.debug("(SensorId=%d). Workflow is running.", sensorDefinition.id)
          Future.successful((): Unit)
        } else {
          val cutOffTime = LocalDateTime.now().minus(recurringSensorConfig.duration)
          dagInstanceRepository
            .countDagInstancesFrom(sensorDefinition.workflowId, cutOffTime)
            .flatMap { count =>
              if (count >= recurringSensorConfig.maxJobsPerDuration) {
                logger.warn(
                  "(SensorId=%d). Skipping dag instance creation," +
                    " because %d dag instances have been created since %s," +
                    " but the allowed maximum is %d",
                  sensorDefinition.id,
                  count,
                  cutOffTime,
                  recurringSensorConfig.maxJobsPerDuration
                )
                Future.successful((): Unit)
              } else {
                val sourceEventId = s"sid=${sensorDefinition.id};t=${eventDateFormatter.format(Instant.now())}"
                val event = Event(sourceEventId, sensorDefinition.id, JsObject.empty)
                logger.trace(
                  "(SensorId=%d). Polling source event (SourceEventId=%s).",
                  sensorDefinition.id,
                  sourceEventId
                )
                eventsProcessor.apply(Seq(event), sensorDefinition.id).map(_ => (): Unit)
              }
            }
        }
      }

    fut.onComplete {
      case Success(_)         => logger.debug("(SensorId=%d). Polling successful.", sensorDefinition.id)
      case Failure(exception) => logger.warn(s"(SensorId=${sensorDefinition.id}). Polling failed.", exception)
    }
    fut
  }

  override def closeInternal(): Unit = {}
}
