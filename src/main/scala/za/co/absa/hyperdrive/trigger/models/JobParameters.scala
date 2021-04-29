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

import play.api.libs.json.{Format, JsResult, JsValue, Json, OFormat}

sealed trait JobParameters

case class Spark(
  jobJar: String,
  mainClass: String,
  deploymentMode: String,
  appArguments: List[String] = List.empty[String],
  additionalJars: List[String] = List.empty[String],
  additionalFiles: List[String] = List.empty[String],
  additionalSparkConfig: Map[String, String] = Map.empty[String, String]
) extends JobParameters

case class HyperConformance(
  appArguments: List[String] = List.empty[String],
  additionalJars: List[String] = List.empty[String],
  additionalFiles: List[String] = List.empty[String],
  additionalSparkConfig: Map[String, String] = Map.empty[String, String]
) extends JobParameters

case class Shell(
  scriptLocation: String
) extends JobParameters

object Spark {
  implicit val sparkFormat: OFormat[Spark] = Json.format[Spark]
}
object HyperConformance {
  implicit val hyperConformanceFormat: OFormat[HyperConformance] = Json.format[HyperConformance]
}
object Shell {
  implicit val shellFormat: OFormat[Shell] = Json.format[Shell]
}
object JobParameters {
  implicit val jobParametersFormat: Format[JobParameters] = new Format[JobParameters] {
    override def writes(o: JobParameters): JsValue = o match {
      case a: Spark => Json.toJson(a)
      case a: Shell => Json.toJson(a)
      case a: HyperConformance => Json.toJson(a)
    }
    override def reads(json: JsValue): JsResult[JobParameters] =
      Spark.sparkFormat.reads(json).orElse(
        HyperConformance.hyperConformanceFormat.reads(json)).orElse(
        Shell.shellFormat.reads(json))
  }
}
