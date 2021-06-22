
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
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType

sealed trait JobTemplateParameters {
  val jobType: JobType
}

case class SparkTemplateParameters(
  jobType: JobType = JobTypes.Spark,
  jobJar: Option[String],
  mainClass: Option[String],
  appArguments: List[String] = List.empty[String],
  additionalJars: List[String] = List.empty[String],
  additionalFiles: List[String] = List.empty[String],
  additionalSparkConfig: Map[String, String] = Map.empty[String, String]
) extends JobTemplateParameters

case class ShellTemplateParameters(
  jobType: JobType = JobTypes.Shell,
  scriptLocation: Option[String]
) extends JobTemplateParameters

object SparkTemplateParameters {
  implicit val sparkFormat: OFormat[SparkTemplateParameters] = Json.using[Json.WithDefaultValues].format[SparkTemplateParameters]
}

object ShellTemplateParameters {
  implicit val shellFormat: OFormat[ShellTemplateParameters] = Json.using[Json.WithDefaultValues].format[ShellTemplateParameters]
}

object JobTemplateParameters {
  implicit val jobParametersFormat = new Format[JobTemplateParameters] {
    override def reads(json: JsValue): JsResult[JobTemplateParameters] = {
      (json \ "jobType").as[String] match {
        case JobTypes.Spark.name => SparkTemplateParameters.sparkFormat.reads(json)
        case JobTypes.Shell.name => ShellTemplateParameters.shellFormat.reads(json)
      }
    }

    override def writes(jobTemplateParameters: JobTemplateParameters): JsValue = jobTemplateParameters match {
      case sparkParameters: SparkTemplateParameters => SparkTemplateParameters.sparkFormat.writes(sparkParameters)
      case shellParameters: ShellTemplateParameters => ShellTemplateParameters.shellFormat.writes(shellParameters)
    }
  }
}
