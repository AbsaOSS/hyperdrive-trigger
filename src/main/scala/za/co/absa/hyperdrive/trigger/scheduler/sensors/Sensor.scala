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
import za.co.absa.hyperdrive.trigger.models.{Event, SensorProperties}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

trait Sensor[T <: SensorProperties] {
  private val logger = LoggerFactory.getLogger(this.getClass)
  val eventsProcessor: (Seq[Event], Long) => Future[Boolean]
  val sensorDefinition: za.co.absa.hyperdrive.trigger.models.Sensor[T]
  implicit val executionContext: ExecutionContext
  def close(): Unit = {
    try {
      closeInternal()
    } catch {
      case NonFatal(e) => logger.warn(s"Couldn't close sensor ${sensorDefinition.id} - ${sensorDefinition}", e)
    }
  }
  def closeInternal(): Unit
}

abstract class PollSensor[T <: SensorProperties](
  override val eventsProcessor: (Seq[Event], Long) => Future[Boolean],
  override val sensorDefinition: za.co.absa.hyperdrive.trigger.models.Sensor[T],
  override val executionContext: ExecutionContext
) extends Sensor[T] {
  implicit val ec: ExecutionContext = executionContext
  def poll(): Future[Unit]
}

abstract class PushSensor[T <: SensorProperties](
  override val eventsProcessor: (Seq[Event], Long) => Future[Boolean],
  override val sensorDefinition: za.co.absa.hyperdrive.trigger.models.Sensor[T],
  override val executionContext: ExecutionContext
) extends Sensor[T] {
  implicit val ec: ExecutionContext = executionContext
  def push: Seq[Event] => Future[Unit]
}