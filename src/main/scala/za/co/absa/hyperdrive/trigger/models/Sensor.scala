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

package za.co.absa.hyperdrive.trigger.models

import javax.validation.Valid
import javax.validation.constraints.NotNull
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes.SensorType

import scala.annotation.meta.field
import scala.beans.BeanProperty

case class Sensor(
  workflowId: Long = 0,
  sensorType: SensorType,
  @(NotNull @field) @(Valid @field) @BeanProperty properties: Properties,
  id: Long = 0
)

case class Properties(
  sensorId: Long = 0,
  @(NotNull @field) @(Valid @field) @BeanProperty settings: Settings,
  @(NotNull @field) @(Valid @field) @BeanProperty matchProperties: Map[String, String]
)

case class Settings(
  @(NotNull @field) @BeanProperty variables: Map[String, String],
  @(NotNull @field) @BeanProperty maps: Map[String, List[String]]
)