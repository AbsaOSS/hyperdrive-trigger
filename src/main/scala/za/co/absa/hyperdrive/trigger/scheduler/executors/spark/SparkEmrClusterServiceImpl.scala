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

import com.amazonaws.services.elasticmapreduce.model.{
  ActionOnFailure,
  AddJobFlowStepsRequest,
  DescribeStepRequest,
  HadoopJarStepConfig,
  ListStepsRequest,
  StepConfig,
  StepState,
  StepSummary
}
import com.typesafe.scalalogging.LazyLogging
import org.apache.commons.lang3.StringUtils
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.configuration.application.SparkConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.{JobStatus, Lost, Submitting}
import za.co.absa.hyperdrive.trigger.models.{JobInstance, SparkInstanceParameters}
import za.co.absa.hyperdrive.trigger.scheduler.executors.spark.SparkEmrClusterServiceImpl.getStepName

import java.util.UUID.randomUUID
import javax.inject.Inject
import scala.annotation.tailrec
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}
import za.co.absa.hyperdrive.trigger.api.rest.utils.Extensions.SparkConfigList

@Service
class SparkEmrClusterServiceImpl @Inject() (
  sparkConfig: SparkConfig,
  emrClusterProvider: EmrClusterProviderService,
  executionContextProvider: SparkClusterServiceExecutionContextProvider
) extends SparkClusterService
    with LazyLogging {
  private implicit val executionContext: ExecutionContext = executionContextProvider.get()
  private val commandRunnerJar = "command-runner.jar"
  private lazy val emr = emrClusterProvider.get()

  override def submitJob(
    jobInstance: JobInstance,
    jobParameters: SparkInstanceParameters,
    updateJob: JobInstance => Future[Unit]
  ): Future[Unit] = {
    val id = randomUUID().toString
    val jiSubmitting = jobInstance.copy(executorJobId = Some(id), jobStatus = Submitting)
    updateJob(jiSubmitting)
      .map { _ =>
        import scala.collection.JavaConverters._
        val stepConfig = new StepConfig()
          .withHadoopJarStep(
            new HadoopJarStepConfig()
              .withJar(commandRunnerJar)
              .withArgs(getSparkArgs(id, jiSubmitting.jobName, jobParameters): _*)
          )
          .withActionOnFailure(ActionOnFailure.CONTINUE)
          .withName(getStepName(jiSubmitting.jobName, jiSubmitting.executorJobId.get))

        val jobFlowStepsRequest = new AddJobFlowStepsRequest()
          .withJobFlowId(sparkConfig.emr.clusterId)
          .withSteps(Seq(stepConfig).asJava)

        val response = emr.addJobFlowSteps(jobFlowStepsRequest)
        val stepId = response.getStepIds.asScala.headOption
        logger.info(s"Added jobFlowStepsRequest $jobFlowStepsRequest for executorId $id and stepId $stepId}")
        logger.info(response.toString)
        stepId
      }
      .flatMap { stepId =>
        val jiStepId = jiSubmitting.copy(stepId = stepId)
        updateJob(jiStepId)
      }
  }

  override def handleMissingYarnStatus(
    jobInstance: JobInstance,
    updateJob: JobInstance => Future[Unit]
  ): Future[Unit] = {
    val updatedJobInstance = jobInstance.stepId match {
      case Some(stepId) =>
        val jobStatus = getStateByStepId(stepId, jobInstance)
        jobInstance.copy(jobStatus = jobStatus)
      case None =>
        logger.debug(s"No stepId set for jobInstance $jobInstance. Getting step Id by step name")
        val stepName = getStepName(jobInstance.jobName, jobInstance.executorJobId.get)
        val stepSummary = getStepSummaryByStepName(stepName)
        stepSummary match {
          case Some(s) =>
            val jobStatus = mapStepStateToJobStatus(s.getStatus.getState, jobInstance)
            jobInstance.copy(stepId = Some(s.getId), jobStatus = jobStatus)
          case None =>
            logger.error(s"No step could be found for jobInstance: $jobInstance")
            jobInstance.copy(jobStatus = Lost)
        }
    }
    updateJob(updatedJobInstance)
  }

  private def getStateByStepId(stepId: String, jobInstance: JobInstance) = {
    val request = new DescribeStepRequest()
      .withClusterId(sparkConfig.emr.clusterId)
      .withStepId(stepId)

    val stepState = emr.describeStep(request).getStep.getStatus.getState
    mapStepStateToJobStatus(stepState, jobInstance)
  }

  @tailrec
  private def getStepSummaryByStepName(
    stepName: String,
    paginationMarker: Option[String] = None
  ): Option[StepSummary] = {
    val request = new ListStepsRequest().withClusterId(sparkConfig.emr.clusterId)
    val requestWithMarker = paginationMarker.map(p => request.withMarker(p)).getOrElse(request)
    val result = emr.listSteps(requestWithMarker)
    import scala.collection.JavaConverters._
    result.getSteps.asScala.find(s => s.getName == stepName) match {
      case Some(x)                                                      => Some(x)
      case None if result.getMarker == null || result.getMarker.isEmpty => None
      case None => getStepSummaryByStepName(stepName, Some(result.getMarker))
    }
  }

  private def getSparkArgs(id: String, jobName: String, jobParameters: SparkInstanceParameters) = {
    val config = sparkConfig.emr
    val sparkSubmitConfs = Map("--deploy-mode" -> "cluster")
    val confs = Map("spark.app.name" -> jobName) ++
      config.additionalConfs ++
      jobParameters.additionalSparkConfig.toKeyValueMap ++
      mergeAdditionalSparkConfig(
        config.additionalConfs ++ Map("spark.yarn.tags" -> id),
        jobParameters.additionalSparkConfig.toKeyValueMap
      )
    val files = config.filesToDeploy ++ jobParameters.additionalFiles
    SparkEmrArgs(
      mainClass = jobParameters.mainClass,
      jobJar = jobParameters.jobJar,
      appName = jobName,
      sparkSubmitConfs = sparkSubmitConfs,
      confs = confs,
      files = files,
      additionalJars = jobParameters.additionalJars,
      sparkArgs = Seq("--verbose"),
      appArgs = jobParameters.appArguments
    ).getArgs
  }

  private def mapStepStateToJobStatus(stepState: String, jobInstance: JobInstance): JobStatus =
    Try(StepState.fromValue(stepState)) match {
      case Failure(exception) =>
        logger.error(s"Encountered unexpected step state $stepState in jobInstance $jobInstance", exception)
        JobStatuses.Lost
      case Success(value) =>
        value match {
          case StepState.PENDING | StepState.CANCEL_PENDING => JobStatuses.Submitting
          case StepState.RUNNING                            => JobStatuses.Running
          case StepState.COMPLETED                          => JobStatuses.Succeeded
          case StepState.CANCELLED                          => JobStatuses.Killed
          case StepState.FAILED | StepState.INTERRUPTED     => JobStatuses.Failed
        }
    }
}

object SparkEmrClusterServiceImpl {
  private val JobNameMaxLength = 50

  /**
   *  @param jobName
   *   a human-readable name
   *  @param jobId
   *   a uuid
   *  @return
   *   the first 50 characters of the job name, followed by a underscore and the uuid
   */
  def getStepName(jobName: String, jobId: String): String =
    s"${StringUtils.abbreviate(jobName, JobNameMaxLength)}_$jobId"
}
