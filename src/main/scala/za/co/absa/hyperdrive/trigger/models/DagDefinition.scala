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

case class DagDefinition(workflowId: Long, id: Long = 0)

case class DagDefinitionJoined(workflowId: Long = 0, jobDefinitions: Seq[JobDefinition], id: Long = 0) {
  def toDag: DagDefinition =
    DagDefinition(workflowId = this.workflowId, id = this.id)
}

object DagDefinitionJoined {
  def apply(dagDefinition: DagDefinition, jobDefinitions: Seq[JobDefinition]): DagDefinitionJoined =
    DagDefinitionJoined(workflowId = dagDefinition.workflowId, jobDefinitions = jobDefinitions, id = dagDefinition.id)
}
