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

import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses.DagInstanceStatus

case class DagInstance(
  status: DagInstanceStatus,
  triggeredBy: String,
  workflowId: Long,
  started: LocalDateTime,
  finished: Option[LocalDateTime],
  id: Long = 0
)

case class DagInstanceJoined(
  status: DagInstanceStatus,
  triggeredBy: String,
  workflowId: Long,
  jobInstances: Seq[JobInstance],
  started: LocalDateTime,
  finished: Option[LocalDateTime],
  id: Long = 0
) {
  def toDagInstance: DagInstance =
    DagInstance(
      status = this.status,
      triggeredBy = this.triggeredBy,
      workflowId = this.workflowId,
      started = this.started,
      finished = this.finished
    )
}
