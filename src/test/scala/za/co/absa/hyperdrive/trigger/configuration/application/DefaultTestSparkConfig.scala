
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

object DefaultTestSparkConfig {
  def apply(
    submitTimeout: Int = 1000,
    hadoopConfDir: String = "",
    master: String = "yarn",
    sparkHome: String = "",
    hadoopResourceManagerUrlBase: String = "",
    filesToDeploy: Seq[String] = Seq(),
    additionalConfs: Map[String, String] = Map(),
    executablesFolder: String = "",
    userUsedToKillJob: String = "Unknown"
  ): SparkConfig = {
    new SparkConfig("yarn", new SparkYarnSinkConfig(submitTimeout, hadoopConfDir, master, sparkHome,
      filesToDeploy.mkString(","), toProperties(additionalConfs), executablesFolder), null, hadoopResourceManagerUrlBase,
      userUsedToKillJob
    )
  }

  def emr(
    clusterId: String = "j-2AXXXXXXGAPLF",
    awsProfile: String = "",
    region: String = "",
    hadoopResourceManagerUrlBase: String = "",
    filesToDeploy: Seq[String] = Seq(),
    additionalConfs: Map[String, String] = Map(),
    userUsedToKillJob: String = "Unknown"
  ): SparkConfig = {
    new SparkConfig("emr", null, new SparkEmrSinkConfig(clusterId, awsProfile, region,
      filesToDeploy.mkString(","), toProperties(additionalConfs)), hadoopResourceManagerUrlBase, userUsedToKillJob
    )
  }

  private def toProperties(map: Map[String, String]): Properties = {
    val properties = new Properties()
    map.foreach { case (key, value) => properties.setProperty(key, value) }
    properties
  }
}
