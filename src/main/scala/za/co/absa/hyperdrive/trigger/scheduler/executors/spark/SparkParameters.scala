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

import za.co.absa.hyperdrive.trigger.models.JobParameters
import scala.util.Try

case class SparkParameters(
  jobJar: String,
  mainClass: String,
  deploymentMode: String,
  appArguments: Set[String],
  additionalJars: Set[String],
  additionalFiles: Set[String]
)

object SparkParameters {
  def apply(jobParameters: JobParameters): SparkParameters = {
    SparkParameters(
      jobJar = jobParameters.variables("jobJar"),
      mainClass = jobParameters.variables("mainClass"),
      deploymentMode = jobParameters.variables("deploymentMode"),
      appArguments = Try(jobParameters.maps("appArguments")).getOrElse(Set.empty[String]),
      additionalJars = Try(jobParameters.maps("additionalJars")).getOrElse(Set.empty[String]),
      additionalFiles = Try(jobParameters.maps("additionalFiles")).getOrElse(Set.empty[String])
    )
  }
}

