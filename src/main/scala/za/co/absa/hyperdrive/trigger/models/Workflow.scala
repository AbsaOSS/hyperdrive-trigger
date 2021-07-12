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

import java.time.LocalDateTime

case class Workflow(
  name: String,
  isActive: Boolean,
  project: String,
  created: LocalDateTime = LocalDateTime.now(),
  updated: Option[LocalDateTime],
  schedulerInstanceId: Option[Long] = None,
  id: Long = 0
)

case class WorkflowState(
  isActive: Boolean
)

case class WorkflowJoined(
  name: String,
  isActive: Boolean,
  project: String,
  created: LocalDateTime = LocalDateTime.now(),
  updated: Option[LocalDateTime],
  schedulerInstanceId: Option[Long] = None,
  sensor: Sensor[SensorProperties],
  dagDefinitionJoined: DagDefinitionJoined,
  id: Long = 0
){
  def toWorkflow: Workflow = {
    Workflow(
      name = this.name,
      isActive = this.isActive,
      project = this.project,
      created = this.created,
      updated = this.updated,
      schedulerInstanceId = this.schedulerInstanceId,
      id = this.id
    )
  }
}
