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
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType

case class JobTemplate(
  name: String,
  jobType: JobType,
  jobParameters: JobParametersTemplate,
  id: Long = 0,
  formConfig: String
)

sealed trait JobParametersTemplate

case class SparkTemplate(
  jobJar: Option[String],
  mainClass: Option[String],
  deploymentMode: Option[String],
  appArguments: Option[List[String]],
  additionalJars: Option[List[String]],
  additionalFiles: Option[List[String]],
  additionalSparkConfig: Option[Map[String, String]]
) extends JobParametersTemplate

case class ShellTemplate(
  scriptLocation: String
) extends JobParametersTemplate

object SparkTemplate {
  implicit val sparkTemplateFormat: OFormat[SparkTemplate] = Json.format[SparkTemplate]
}

object ShellTemplate {
  implicit val shellTemplateFormat: OFormat[ShellTemplate] = Json.format[ShellTemplate]
}
object JobParametersTemplate {
  implicit val jobParametersFormat: Format[JobParametersTemplate] = new Format[JobParametersTemplate] {
    override def writes(o: JobParametersTemplate): JsValue = o match {
      case a: ShellTemplate => Json.toJson(a)
      case a: SparkTemplate => Json.toJson(a)
    }
    override def reads(json: JsValue): JsResult[JobParametersTemplate] =
      ShellTemplate.shellTemplateFormat.reads(json).orElse(
        SparkTemplate.sparkTemplateFormat.reads(json))
  }
}
