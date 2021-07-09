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

package za.co.absa.hyperdrive.trigger.scheduler.sensors.kafka

import za.co.absa.hyperdrive.trigger.models.{AbsaKafkaSensorProperties, Event, SensorIds, SensorProperties}
import za.co.absa.hyperdrive.trigger.scheduler.sensors.PollSensor
import scala.concurrent.{ExecutionContext, Future}

class AbsaKafkaSensor(
  eventsProcessor: (Seq[Event], Long) => Future[Boolean],
  sensorIds: SensorIds,
  sensorProperties: AbsaKafkaSensorProperties,
  consumeFromLatest: Boolean = false,
  executionContext: ExecutionContext
) extends PollSensor[AbsaKafkaSensorProperties](eventsProcessor, sensorIds, sensorProperties, executionContext) {

  val kafkaSensor = new KafkaSensor(
    eventsProcessor,
    sensorIds,
    sensorProperties.toKafkaSensorProperties,
    consumeFromLatest,
    executionContext
  )

  override def poll(): Future[Unit] = kafkaSensor.poll()

  override def closeInternal(): Unit = kafkaSensor.closeInternal()
}
