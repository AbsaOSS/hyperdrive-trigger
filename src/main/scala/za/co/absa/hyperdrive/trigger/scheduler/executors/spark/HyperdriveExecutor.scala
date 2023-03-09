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

import org.slf4j.LoggerFactory
import za.co.absa.hyperdrive.trigger.api.rest.services.HyperdriveOffsetService
import za.co.absa.hyperdrive.trigger.configuration.application.SparkConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses
import za.co.absa.hyperdrive.trigger.models.{JobInstance, SparkInstanceParameters}

import scala.concurrent.{ExecutionContext, Future}

object HyperdriveExecutor {
  private val logger = LoggerFactory.getLogger(this.getClass)

  def execute(
    jobInstance: JobInstance,
    jobParameters: SparkInstanceParameters,
    updateJob: JobInstance => Future[Unit],
    sparkClusterService: SparkClusterService,
    offsetService: HyperdriveOffsetService
  )(implicit executionContext: ExecutionContext, sparkConfig: SparkConfig): Future[Unit] =
    jobInstance.executorJobId match {
      case None => submitJob(sparkClusterService, offsetService, jobInstance, jobParameters, updateJob)
      case Some(executorJobId) =>
        SparkExecutor.updateJobStatus(executorJobId, jobInstance, updateJob, sparkClusterService)
    }

  private def submitJob(sparkClusterService: SparkClusterService,
                        offsetService: HyperdriveOffsetService,
                        jobInstance: JobInstance,
                        jobParameters: SparkInstanceParameters,
                        updateJob: JobInstance => Future[Unit]
  )(implicit executionContext: ExecutionContext) = {
    logger.debug("Using HyperdriveExecutor")
    for {
      newJobRequired <- offsetService.isNewJobInstanceRequired(jobParameters)
      _ <-
        if (newJobRequired) sparkClusterService.submitJob(jobInstance, jobParameters, updateJob)
        else updateJob(jobInstance.copy(jobStatus = JobStatuses.NoData))
    } yield ()
  }
}
