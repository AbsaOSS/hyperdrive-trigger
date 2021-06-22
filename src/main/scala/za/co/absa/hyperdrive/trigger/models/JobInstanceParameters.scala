
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

sealed trait JobInstanceParameters {
  val jobType: JobType
}

case class SparkInstanceParameters(
  jobType: JobType = JobTypes.Spark,
  jobJar: String,
  mainClass: String,
  appArguments: List[String] = List.empty[String],
  additionalJars: List[String] = List.empty[String],
  additionalFiles: List[String] = List.empty[String],
  additionalSparkConfig: Map[String, String] = Map.empty[String, String]
) extends JobInstanceParameters

case class ShellInstanceParameters(
  jobType: JobType = JobTypes.Shell,
  scriptLocation: String
) extends JobInstanceParameters

object SparkInstanceParameters {
  implicit val sparkFormat: OFormat[SparkInstanceParameters] = Json.using[Json.WithDefaultValues].format[SparkInstanceParameters]
}

object ShellInstanceParameters {
  implicit val shellFormat: OFormat[ShellInstanceParameters] = Json.using[Json.WithDefaultValues].format[ShellInstanceParameters]
}

object JobInstanceParameters {
  implicit val jobParametersFormat = new Format[JobInstanceParameters] {
    override def reads(json: JsValue): JsResult[JobInstanceParameters] = {
      (json \ "jobType").as[String] match {
        case JobTypes.Spark.name => SparkInstanceParameters.sparkFormat.reads(json)
        case JobTypes.Shell.name => ShellInstanceParameters.shellFormat.reads(json)
      }
    }

    override def writes(jobInstanceParameters: JobInstanceParameters): JsValue = jobInstanceParameters match {
      case sparkParameters: SparkInstanceParameters => SparkInstanceParameters.sparkFormat.writes(sparkParameters)
      case shellParameters: ShellInstanceParameters => ShellInstanceParameters.shellFormat.writes(shellParameters)
    }
  }
}
