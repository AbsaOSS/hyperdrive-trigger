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

import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.JsonBodyReadables._
import za.co.absa.hyperdrive.trigger.api.rest.utils.WSClientProvider
import za.co.absa.hyperdrive.trigger.configuration.application.SparkConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses._
import za.co.absa.hyperdrive.trigger.models.{JobInstance, SparkInstanceParameters}
import za.co.absa.hyperdrive.trigger.scheduler.executors.spark.{FinalStatuses => YarnFinalStatuses}

import java.time.LocalDateTime
import java.time.temporal.ChronoUnit
import scala.concurrent.{ExecutionContext, Future}

object SparkExecutor {
  private val ExtraSubmitTimeout = 60000

  def execute(
    jobInstance: JobInstance,
    jobParameters: SparkInstanceParameters,
    updateJob: JobInstance => Future[Unit],
    sparkClusterService: SparkClusterService
  )(implicit executionContext: ExecutionContext, sparkConfig: SparkConfig): Future[Unit] =
    jobInstance.executorJobId match {
      case None                => sparkClusterService.submitJob(jobInstance, jobParameters, updateJob)
      case Some(executorJobId) => updateJobStatus(executorJobId, jobInstance, updateJob, sparkClusterService)
    }

  private[spark] def updateJobStatus(
    executorJobId: String,
    jobInstance: JobInstance,
    updateJob: JobInstance => Future[Unit],
    sparkClusterService: SparkClusterService
  )(implicit executionContext: ExecutionContext, sparkConfig: SparkConfig): Future[Unit] =
    WSClientProvider.getWSClient.url(getStatusUrl(executorJobId)).get().map { response =>
      (Json.fromJson[AppsResponse](response.body[JsValue]).asOpt match {
        case Some(asd) => asd.apps.app
        case None      => Seq.empty
      }) match {
        case Seq(first) =>
          updateJob(getUpdatedJobInstance(jobInstance, first))
        case _
            // It relies on the same value set for sparkYarnSink.submitTimeout in multi instance deployment
            if jobInstance.jobStatus == JobStatuses.Submitting && jobInstance.updated
              .map(lastUpdated => ChronoUnit.MILLIS.between(lastUpdated, LocalDateTime.now()))
              .exists(_ < sparkConfig.yarn.submitTimeout + ExtraSubmitTimeout) =>
          // Do nothing for submit timeout period to avoid two parallel job submissions/executions
          Future((): Unit)
        case _ => sparkClusterService.handleMissingYarnStatus(jobInstance, updateJob)
      }
    }

  private def getStatusUrl(executorJobId: String)(implicit sparkConfig: SparkConfig): String =
    s"${sparkConfig.hadoopResourceManagerUrlBase}/ws/v1/cluster/apps?applicationTags=$executorJobId"

  private def getUpdatedJobInstance(
    jobInstance: JobInstance,
    app: App
  )(implicit sparkConfig: SparkConfig): JobInstance = {
    val diagnostics = app.diagnostics match {
      case "" => None
      case _ if !sparkConfig.saveDiagnostics => None
      case _  => Some(app.diagnostics)
    }

    jobInstance.copy(
      jobStatus = getStatus(app.finalStatus),
      applicationId = Some(app.id),
      updated = Option(LocalDateTime.now()),
      diagnostics = diagnostics
    )
  }

  private def getStatus(finalStatus: String): JobStatus =
    finalStatus match {
      case fs if fs == YarnFinalStatuses.Undefined.name => Running
      case fs if fs == YarnFinalStatuses.Succeeded.name => Succeeded
      case fs if fs == YarnFinalStatuses.Failed.name    => Failed
      case fs if fs == YarnFinalStatuses.Killed.name    => Killed
      case _                                            => Lost
    }
}
