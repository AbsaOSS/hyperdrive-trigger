
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

import za.co.absa.hyperdrive.trigger.configuration.application.JobDefinitionConfig.{KeysToMerge, MergedValuesSeparator}
import za.co.absa.hyperdrive.trigger.models.{JobInstance, SparkInstanceParameters}

import scala.concurrent.{ExecutionContext, Future}

trait SparkClusterService {
  def submitJob(jobInstance: JobInstance, jobParameters: SparkInstanceParameters,
                updateJob: JobInstance => Future[Unit]): Future[Unit]

  def handleMissingYarnStatus(jobInstance: JobInstance, updateJob: JobInstance => Future[Unit]): Future[Unit]

  protected def mergeAdditionalSparkConfig(globalConfig: Map[String, String], jobConfig: Map[String, String]): Map[String, String] =
    KeysToMerge.map(key => {
      val globalValue = globalConfig.getOrElse(key, "")
      val jobValue = jobConfig.getOrElse(key, "")
      key -> s"$globalValue$MergedValuesSeparator$jobValue".trim
    }).toMap
}
