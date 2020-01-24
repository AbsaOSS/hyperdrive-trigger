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

package za.co.absa.hyperdrive.trigger.scheduler.executors.spark

import play.api.libs.json.{Json, OFormat}

case class App(
                id: String,
                name: String,
                state: String,
                finalStatus: String
              )

case class Apps(app: Seq[App])

case class AppsResponse(apps: Apps)

object AppsResponse {
  implicit val appFormat: OFormat[App] = Json.format[App]
  implicit val appsFormat: OFormat[Apps] = Json.format[Apps]
  implicit val appsResponseFormat: OFormat[AppsResponse] = Json.format[AppsResponse]
}

object FinalStatuses {

  sealed abstract class FinalStatus(val name: String) {
    override def toString: String = name
  }

  case object Undefined extends FinalStatus("UNDEFINED")
  case object Succeeded extends FinalStatus("SUCCEEDED")
  case object Failed extends FinalStatus("FAILED")
  case object Killed extends FinalStatus("KILLED")

  val finalStatuses: Set[FinalStatus] = Set(Undefined, Succeeded, Failed, Killed)

}