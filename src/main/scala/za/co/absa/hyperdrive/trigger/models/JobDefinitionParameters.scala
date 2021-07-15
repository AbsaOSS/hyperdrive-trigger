
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
import za.co.absa.hyperdrive.trigger.models.enums.FormConfigs.FormConfig
import za.co.absa.hyperdrive.trigger.models.enums.FormConfigs

sealed trait JobDefinitionParameters {
  val formConfig: FormConfig
}

case class SparkDefinitionParameters(
  formConfig: FormConfig = FormConfigs.Spark,
  jobJar: Option[String],
  mainClass: Option[String],
  appArguments: List[String] = List.empty[String],
  additionalJars: List[String] = List.empty[String],
  additionalFiles: List[String] = List.empty[String],
  additionalSparkConfig: Map[String, String] = Map.empty[String, String]
) extends JobDefinitionParameters

case class HyperdriveDefinitionParameters(
  formConfig: FormConfig = FormConfigs.Hyperdrive,
  appArguments: List[String] = List.empty[String],
  additionalJars: List[String] = List.empty[String],
  additionalFiles: List[String] = List.empty[String],
  additionalSparkConfig: Map[String, String] = Map.empty[String, String]
) extends JobDefinitionParameters

case class ShellDefinitionParameters(
  formConfig: FormConfig = FormConfigs.Shell,
  scriptLocation: Option[String]
) extends JobDefinitionParameters

object SparkDefinitionParameters {
  implicit val sparkFormat: OFormat[SparkDefinitionParameters] = Json.using[Json.WithDefaultValues].format[SparkDefinitionParameters]
}

object HyperdriveDefinitionParameters {
  implicit val hyperdriveFormat: OFormat[HyperdriveDefinitionParameters] = Json.using[Json.WithDefaultValues].format[HyperdriveDefinitionParameters]
}

object ShellDefinitionParameters {
  implicit val shellFormat: OFormat[ShellDefinitionParameters] = Json.using[Json.WithDefaultValues].format[ShellDefinitionParameters]
}

object JobDefinitionParameters {
  implicit val jobParametersFormat = new Format[JobDefinitionParameters] {
    override def reads(json: JsValue): JsResult[JobDefinitionParameters] = {
      (json \ "formConfig").as[String] match {
        case FormConfigs.Spark.name => SparkDefinitionParameters.sparkFormat.reads(json)
        case FormConfigs.Hyperdrive.name => HyperdriveDefinitionParameters.hyperdriveFormat.reads(json)
        case FormConfigs.Shell.name => ShellDefinitionParameters.shellFormat.reads(json)
      }
    }

    override def writes(jobDefinitionParameters: JobDefinitionParameters): JsValue = jobDefinitionParameters match {
      case sparkParameters: SparkDefinitionParameters => SparkDefinitionParameters.sparkFormat.writes(sparkParameters)
      case hyperdriveParameters: HyperdriveDefinitionParameters => HyperdriveDefinitionParameters.hyperdriveFormat.writes(hyperdriveParameters)
      case shellParameters: ShellDefinitionParameters => ShellDefinitionParameters.shellFormat.writes(shellParameters)
    }
  }
}
