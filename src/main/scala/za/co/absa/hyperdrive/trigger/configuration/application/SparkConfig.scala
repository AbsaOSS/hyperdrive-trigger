
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
import org.springframework.validation.{Errors, Validator}
import za.co.absa.hyperdrive.trigger.configuration.application.SparkConfig.{transformAdditionalConfsProperty, transformFilesProperty}

import java.util.Properties
import javax.validation.constraints.{NotBlank, NotNull}
import scala.annotation.meta.field

@ConfigurationProperties
@ConstructorBinding
@Validated
class SparkConfig (
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
  val userUsedToKillJob: String
) {
  if (submitApi == "yarn" && yarn == null) {
    throw new RuntimeException("If spark.submitApi is yarn, sparkYarnSink arguments are required")
  } else if (submitApi == "emr" && emr == null) {
    throw new RuntimeException("If spark.submitApi is emr, spark.emr arguments are required")
  } else if (submitApi != "yarn" && submitApi != "emr") {
    throw new RuntimeException("spark.submitApi has to be either 'yarn' or 'emr'")
  }
}

object SparkConfig {
  def transformFilesProperty(filesToDeployInternal: String): Seq[String] = Option(filesToDeployInternal)
    .map(_.split(",").toSeq)
    .getOrElse(Seq())
    .filter(_.nonEmpty)

  def transformAdditionalConfsProperty(additionalConfsInternal: Properties): Map[String, String] = {
    import scala.collection.JavaConverters._
    Option(additionalConfsInternal)
      .map(_.asScala.toMap).getOrElse(Map())
  }
}

class SparkYarnSinkConfig (
  @NotNull
  val submitTimeout: Int,
  @(NotBlank @field)
  val hadoopConfDir: String,
  @(NotBlank @field)
  val master: String,
  @(NotBlank @field)
  val sparkHome: String,
  @Name("filesToDeploy")
  filesToDeployInternal: String,
  @Name("additionalConfs")
  additionalConfsInternal: Properties,
  @NotNull
  val executablesFolder: String
) {
  val filesToDeploy: Seq[String] = transformFilesProperty(filesToDeployInternal)
  val additionalConfs: Map[String, String] = transformAdditionalConfsProperty(additionalConfsInternal)
}

class SparkEmrSinkConfig (
  @NotNull
  val clusterId: String,
  @Name("awsProfile")
  awsProfileInternal: String,
  @Name("region")
  regionInternal: String,
  @Name("filesToDeploy")
  filesToDeployInternal: String,
  @Name("additionalConfs")
  additionalConfsInternal: Properties
) {
  import scala.collection.JavaConverters._
  val awsProfile: Option[String] = Option(awsProfileInternal)
  val region: Option[String] = Option(regionInternal)
  val filesToDeploy: Seq[String] = transformFilesProperty(filesToDeployInternal)
  val additionalConfs: Map[String, String] = transformAdditionalConfsProperty(additionalConfsInternal)
}
