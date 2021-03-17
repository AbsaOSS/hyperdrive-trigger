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

import java.nio.file.Paths

import za.co.absa.hyperdrive.trigger.models.JobParameters
import za.co.absa.hyperdrive.trigger.scheduler.utilities.ExecutorsConfig

import scala.util.Try

case class SparkParameters(
  jobJar: String,
  mainClass: String,
  deploymentMode: String,
  appArguments: List[String],
  additionalJars: List[String],
  additionalFiles: List[String],
  additionalSparkConfig: Map[String, String]
)

/**
 * See workflow.service.ts for the definition of the keys
 */
object SparkParameters {
  def apply(jobParameters: JobParameters): SparkParameters = {
    SparkParameters(
      jobJar = Paths.get(ExecutorsConfig.getExecutablesFolder, jobParameters.variables("jobJar")).toString,
      mainClass = jobParameters.variables("mainClass"),
      deploymentMode = jobParameters.variables("deploymentMode"),
      appArguments = Try(jobParameters.maps("appArguments")).getOrElse(List.empty[String]),
      additionalJars = Try(jobParameters.maps("additionalJars")).getOrElse(List.empty[String]).map(jar => Paths.get(ExecutorsConfig.getExecutablesFolder, jar).toString),
      additionalFiles = Try(jobParameters.maps("additionalFiles")).getOrElse(List.empty[String]).map(file => Paths.get(ExecutorsConfig.getExecutablesFolder, file).toString),
      additionalSparkConfig = Try(jobParameters.keyValuePairs("additionalSparkConfig")).getOrElse(Map.empty[String, String])
    )
  }
}

