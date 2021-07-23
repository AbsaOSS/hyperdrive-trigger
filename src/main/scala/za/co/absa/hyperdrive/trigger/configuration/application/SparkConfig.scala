
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

import java.util.Properties
import javax.validation.constraints.{NotBlank, NotNull}
import scala.annotation.meta.field

@ConfigurationProperties("spark")
@ConstructorBinding
@Validated
class SparkConfig (
  @DefaultValue(Array("yarn"))
  val submitApi: String,
  @Name("yarn.sink")
  val yarn: SparkYarnSinkConfig,
  @Name("emr")
  // Todo: Make sure that this is not null when submitApi is emr
  val emr: SparkEmrSinkConfig,
  @(NotBlank @field)
  val hadoopResourceManagerUrlBase: String,
  @DefaultValue(Array("Unknown"))
  val userUsedToKillJob: String
)

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
  import scala.collection.JavaConverters._
  val filesToDeploy: Seq[String] = Option(filesToDeployInternal).map(_.split(",").toSeq).getOrElse(Seq())
  val additionalConfs: Map[String, String] = Option(additionalConfsInternal).map(_.asScala.toMap).getOrElse(Map())
}

class SparkEmrSinkConfig (
  @NotNull
  val clusterId: String,
  @Name("filesToDeploy")
  filesToDeployInternal: String,
  @Name("additionalConfs")
  additionalConfsInternal: Properties
) {
  import scala.collection.JavaConverters._
  val filesToDeploy: Seq[String] = Option(filesToDeployInternal).map(_.split(",").toSeq).getOrElse(Seq())
  val additionalConfs: Map[String, String] = Option(additionalConfsInternal).map(_.asScala.toMap).getOrElse(Map())
}