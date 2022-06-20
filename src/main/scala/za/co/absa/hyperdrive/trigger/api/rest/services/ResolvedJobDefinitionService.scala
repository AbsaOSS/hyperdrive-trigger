
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

package za.co.absa.hyperdrive.trigger.api.rest.services

import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.driver.drivers.CommandLineIngestionDriver
import za.co.absa.hyperdrive.trigger.configuration.application.SparkConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.models.{ResolvedJobDefinition, SparkInstanceParameters}

import javax.inject.Inject

trait ResolvedJobDefinitionService {
  def resolveAppArguments(jobDefinition: ResolvedJobDefinition): ResolvedJobDefinition
  def getLatestOffsetFileParams(jobDefinition: ResolvedJobDefinition): Option[GetLatestOffsetFileParams]
}

@Service
class ResolvedJobDefinitionServiceImpl @Inject()(sparkConfig: SparkConfig) extends ResolvedJobDefinitionService {
  private val HyperdriveCheckpointKey = "writer.common.checkpoint.location"

  override def resolveAppArguments(jobDefinition: ResolvedJobDefinition): ResolvedJobDefinition = {
    if (
      jobDefinition.jobParameters.jobType != JobTypes.Hyperdrive ||
        !jobDefinition.jobParameters.isInstanceOf[SparkInstanceParameters]
    ) {
      jobDefinition
    } else {
      val jobParameters = jobDefinition.jobParameters.asInstanceOf[SparkInstanceParameters]
      val args = jobParameters.appArguments
      val config = CommandLineIngestionDriver.parseConfiguration(args.toArray)
      import scala.collection.JavaConverters._
      val resolvedArgs = config.getKeys.asScala.map {
        k => s"${k}=${config.getString(k)}"
      }.toList

      jobDefinition.copy(jobParameters = jobParameters.copy(appArguments = resolvedArgs))
    }
  }

  override def getLatestOffsetFileParams(jobDefinition: ResolvedJobDefinition): Option[GetLatestOffsetFileParams] = {
    if (
      jobDefinition.jobParameters.jobType != JobTypes.Hyperdrive ||
        !jobDefinition.jobParameters.isInstanceOf[SparkInstanceParameters]
    ) {
      None
    } else {
      for {
        keytab <- sparkConfig.yarn.additionalConfs.get("spark.yarn.keytab")
        principal <- sparkConfig.yarn.additionalConfs.get("spark.yarn.principal")
        checkpointLocation <- jobDefinition.jobParameters.asInstanceOf[SparkInstanceParameters].appArguments
          .find(_.startsWith(HyperdriveCheckpointKey))
          .map(_.replace(s"$HyperdriveCheckpointKey=", ""))
      } yield new GetLatestOffsetFileParams(keytab, principal, checkpointLocation)
    }
  }
}
