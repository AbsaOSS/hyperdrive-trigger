
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

import java.nio.file.Paths
import play.api.libs.json.{Format, JsResult, JsValue, Json, OFormat}
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType
import za.co.absa.hyperdrive.trigger.scheduler.utilities.{ShellExecutorConfig, SparkExecutorConfig}

import scala.util.Try

sealed trait JobInstanceParameters {
  val jobType: JobType
}

case class SparkParameters(
  jobType: JobType = JobTypes.Spark,
  jobJar: String,
  mainClass: String,
  appArguments: List[String] = List.empty[String],
  additionalJars: List[String] = List.empty[String],
  additionalFiles: List[String] = List.empty[String],
  additionalSparkConfig: Map[String, String] = Map.empty[String, String]
) extends JobInstanceParameters

case class ShellParameters(
  jobType: JobType = JobTypes.Shell,
  scriptLocation: String
) extends JobInstanceParameters

object SparkParameters {
  implicit val sparkFormat: OFormat[SparkParameters] = Json.using[Json.WithDefaultValues].format[SparkParameters]

  def apply(jobParameters: JobParameters): SparkParameters = {
    SparkParameters(
      jobJar = Paths.get(SparkExecutorConfig.getExecutablesFolder, jobParameters.variables("jobJar")).toString,
      mainClass = jobParameters.variables("mainClass"),
      appArguments = Try(jobParameters.maps("appArguments")).getOrElse(List.empty[String]),
      additionalJars = Try(jobParameters.maps("additionalJars")).getOrElse(List.empty[String]).map(jar => Paths.get(SparkExecutorConfig.getExecutablesFolder, jar).toString),
      additionalFiles = Try(jobParameters.maps("additionalFiles")).getOrElse(List.empty[String]).map(file => Paths.get(SparkExecutorConfig.getExecutablesFolder, file).toString),
      additionalSparkConfig = Try(jobParameters.keyValuePairs("additionalSparkConfig")).getOrElse(Map.empty[String, String])
    )
  }
}

object ShellParameters {
  implicit val shellFormat: OFormat[ShellParameters] = Json.using[Json.WithDefaultValues].format[ShellParameters]

  def apply(jobParameters: JobParameters): ShellParameters = new ShellParameters(
    scriptLocation = Paths.get(ShellExecutorConfig.getExecutablesFolder, jobParameters.variables("scriptLocation")).toString
  )
}

object JobInstanceParameters {
  implicit val jobParametersFormat = new Format[JobInstanceParameters] {
    override def reads(json: JsValue): JsResult[JobInstanceParameters] = {
      (json \ "jobType").as[String] match {
        case JobTypes.Spark.name => SparkParameters.sparkFormat.reads(json)
        case JobTypes.Shell.name => ShellParameters.shellFormat.reads(json)
      }
    }

    override def writes(jobInstanceParameters: JobInstanceParameters): JsValue = jobInstanceParameters match {
      case sparkParameters: SparkParameters => SparkParameters.sparkFormat.writes(sparkParameters)
      case shellParameters: ShellParameters => ShellParameters.shellFormat.writes(shellParameters)
    }
  }
}
