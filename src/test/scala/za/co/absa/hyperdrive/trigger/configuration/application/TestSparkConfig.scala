
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

case class TestSparkConfig(
  submitApi: String,
  yarn: TestSparkYarnSinkConfig,
  emr: TestSparkEmrSinkConfig,
  hadoopResourceManagerUrlBase: String,
  userUsedToKillJob: String
) {
  def toSparkConfig: SparkConfig = {
    val yarnConfig = if (yarn != null) yarn.toSparkYarnSinkConfig else null
    val emrConfig = if (emr != null) emr.toSparkEmrSinkConfig else null
    new SparkConfig(
      submitApi,
      yarnConfig,
      emrConfig,
      hadoopResourceManagerUrlBase,
      userUsedToKillJob
    )
  }
}

case class TestSparkYarnSinkConfig(
  submitTimeout: Int,
  hadoopConfDir: String,
  master: String,
  sparkHome: String,
  filesToDeployInternal: String,
  additionalConfsInternal: Properties,
  executablesFolder: String
) {
  def toSparkYarnSinkConfig: SparkYarnSinkConfig = {
    new SparkYarnSinkConfig(
      submitTimeout,
      hadoopConfDir,
      master,
      sparkHome,
      filesToDeployInternal,
      additionalConfsInternal,
      executablesFolder
    )
  }
}

case class TestSparkEmrSinkConfig(
  clusterId: String,
  awsProfileInternal: String,
  regionInternal: String,
  filesToDeployInternal: String,
  additionalConfsInternal: Properties
) {
  def toSparkEmrSinkConfig: SparkEmrSinkConfig = {
    new SparkEmrSinkConfig(
      clusterId,
      awsProfileInternal,
      regionInternal,
      filesToDeployInternal,
      additionalConfsInternal
    )
  }
}
