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

package za.co.absa.hyperdrive.trigger.models.enums

import play.api.libs.json.{Format, JsError, JsObject, JsPath, Json, OFormat, OWrites, Reads, Writes}
import za.co.absa.hyperdrive.trigger.models.NotificationRule
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses.DagInstanceStatus

object DagInstanceStatuses {

  sealed abstract class DagInstanceStatus(val name: String, val isFinalStatus: Boolean, val isFailed: Boolean, val isRunning: Boolean) {
    override def toString: String = name
  }

  case object InQueue extends DagInstanceStatus("InQueue", false, false, false)
  case object Running extends DagInstanceStatus("Running", false, false, true)
  case object Succeeded extends DagInstanceStatus("Succeeded", true, false, false)
  case object Failed extends DagInstanceStatus("Failed", true, true, false)
  case object Skipped extends DagInstanceStatus("Skipped", true, false, false)

  val statuses: Set[DagInstanceStatus] = Set(InQueue,Running,Succeeded,Failed,Skipped)
  val nonFinalStatuses: Set[DagInstanceStatus] = statuses.filter(!_.isFinalStatus)

  def convertStatusNameToDagInstanceStatus(statusName: String): DagInstanceStatus = {
    DagInstanceStatuses.statuses.find(_.name == statusName).getOrElse(
      throw new Exception(s"Couldn't find DagInstanceStatus: $statusName")
    )
  }

  implicit val dagInstanceStatusFormat: OFormat[DagInstanceStatus] = OFormat[DagInstanceStatus](
    (JsPath \ "name").read[String].map(convertStatusNameToDagInstanceStatus),
    OWrites[DagInstanceStatus] { status => Json.obj("name" -> status.name)}
  )
}
