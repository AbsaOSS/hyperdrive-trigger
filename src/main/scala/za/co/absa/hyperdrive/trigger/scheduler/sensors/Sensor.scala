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

import za.co.absa.hyperdrive.trigger.models.{Event, Properties}

import scala.concurrent.{ExecutionContext, Future}

trait Sensor {
  val eventsProcessor: (Seq[Event], Properties) => Future[Boolean]
  val properties: Properties
  implicit val executionContext: ExecutionContext
  def close(): Unit
}

abstract class PollSensor(
  override val eventsProcessor: (Seq[Event], Properties) => Future[Boolean],
  override val properties: Properties,
  override val executionContext: ExecutionContext
) extends Sensor {
  implicit val ec: ExecutionContext = executionContext
  def poll(): Future[Unit]
}

abstract class PushSensor(
  override val eventsProcessor: (Seq[Event], Properties) => Future[Boolean],
  override val properties: Properties,
  override val executionContext: ExecutionContext
) extends Sensor {
  implicit val ec: ExecutionContext = executionContext
  def push: Seq[Event] => Future[Unit]
}