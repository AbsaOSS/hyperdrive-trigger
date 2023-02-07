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

import java.util.Properties

case class DefaultTestSparkConfig(
  submitApi: String = "yarn",
  submitTimeout: Int = 1000,
  master: String = "yarn",
  hadoopResourceManagerUrlBase: String = "",
  filesToDeploy: Seq[String] = Seq(),
  additionalConfs: Map[String, String] = Map(),
  userUsedToKillJob: String = "Unknown",
  sparkSubmitThreadPoolSize: Int = 10,
  clusterId: String = "j-2AXXXXXXGAPLF"
) {
  def yarn: SparkConfig =
    new SparkConfig(
      submitApi,
      new SparkYarnSinkConfig(submitTimeout, master, filesToDeploy.mkString(","), toProperties(additionalConfs)),
      null,
      hadoopResourceManagerUrlBase,
      userUsedToKillJob,
      sparkSubmitThreadPoolSize
    )

  def emr: SparkConfig =
    new SparkConfig(
      submitApi,
      null,
      new SparkEmrSinkConfig(clusterId, filesToDeploy.mkString(","), toProperties(additionalConfs)),
      hadoopResourceManagerUrlBase,
      userUsedToKillJob,
      sparkSubmitThreadPoolSize
    )

  private def toProperties(map: Map[String, String]): Properties = {
    val properties = new Properties()
    map.foreach { case (key, value) => properties.setProperty(key, value) }
    properties
  }
}
