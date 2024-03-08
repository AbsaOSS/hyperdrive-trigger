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

package za.co.absa.hyperdrive.trigger.configuration.application

import org.springframework.boot.context.properties.bind.{DefaultValue, Name}
import org.springframework.boot.context.properties.{ConfigurationProperties, ConstructorBinding}
import org.springframework.validation.annotation.Validated
import za.co.absa.hyperdrive.trigger.configuration.application.ConfigUtil._

import java.util.Properties
import javax.validation.constraints.NotBlank
import scala.annotation.meta.field

@ConfigurationProperties
@ConstructorBinding
@Validated
@SparkConfigNestedClasses
class SparkConfig(
  @DefaultValue(Array("yarn"))
  @Name("spark.submitApi")
  val submitApi: String,
  @Name("sparkYarnSink")
  val yarn: SparkYarnSinkConfig,
  @Name("spark.emr")
  val emr: SparkEmrSinkConfig,
  @(NotBlank @field)
  @Name("sparkYarnSink.hadoopResourceManagerUrlBase")
  val hadoopResourceManagerUrlBase: String,
  @DefaultValue(Array("Unknown"))
  @Name("sparkYarnSink.userUsedToKillJob")
  val userUsedToKillJob: String,
  @DefaultValue(Array("false"))
  @Name("sparkYarnSink.saveDiagnostics")
  val saveDiagnostics: Boolean,
  @DefaultValue(Array("10"))
  @Name("spark.submit.thread.pool.size")
  val sparkSubmitThreadPoolSize: Int
)

class SparkYarnSinkConfig(
  val submitTimeout: Int,
  val master: String,
  @Name("filesToDeploy")
  filesToDeployInternal: String,
  @Name("additionalConfs")
  additionalConfsInternal: Properties
) {
  val filesToDeploy: Seq[String] = splitString(filesToDeployInternal, ",")
  val additionalConfs: Map[String, String] = transformProperties(additionalConfsInternal)
}

class SparkEmrSinkConfig(
  val clusterId: String,
  @Name("filesToDeploy")
  filesToDeployInternal: String,
  @Name("additionalConfs")
  additionalConfsInternal: Properties
) {
  val filesToDeploy: Seq[String] = splitString(filesToDeployInternal, ",")
  val additionalConfs: Map[String, String] = transformProperties(additionalConfsInternal)
}
