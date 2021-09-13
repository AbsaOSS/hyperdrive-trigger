
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

import com.amazonaws.services.elasticmapreduce.model.{ActionOnFailure, AddJobFlowStepsRequest, HadoopJarStepConfig, StepConfig}
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.configuration.application.SparkConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.Submitting
import za.co.absa.hyperdrive.trigger.models.{JobInstance, SparkInstanceParameters}

import java.util.UUID.randomUUID
import javax.inject.Inject
import scala.concurrent.{ExecutionContext, Future}

@Service
class SparkEmrClusterServiceImpl @Inject()(sparkConfig: SparkConfig, emrClusterProvider: EmrClusterProviderService) extends SparkClusterService {
  private val logger = LoggerFactory.getLogger(this.getClass)
  private val commandRunnerJar = "command-runner.jar"

  override def submitJob(jobInstance: JobInstance, jobParameters: SparkInstanceParameters, updateJob: JobInstance => Future[Unit])
                        (implicit executionContext: ExecutionContext): Future[Unit] = {
    val id = randomUUID().toString
    val ji = jobInstance.copy(executorJobId = Some(id), jobStatus = Submitting)
    updateJob(ji).map { _ =>
      import scala.collection.JavaConverters._
      val stepConfig = new StepConfig()
        .withHadoopJarStep(new HadoopJarStepConfig()
          .withJar(commandRunnerJar)
          .withArgs(getSparkArgs(id, ji.jobName, jobParameters):_*)
        )
        .withActionOnFailure(ActionOnFailure.CONTINUE)
        .withName(jobInstance.jobName)

      val jobFlowStepsRequest = new AddJobFlowStepsRequest()
        .withJobFlowId(sparkConfig.emr.clusterId)
        .withSteps(Seq(stepConfig).asJava)

      val emr = emrClusterProvider.get()
      val response = emr.addJobFlowSteps(jobFlowStepsRequest)
      val stepId = response.getStepIds.asScala.headOption
      logger.info(s"Added jobFlowStepsRequest ${jobFlowStepsRequest} for executorId ${id} and stepId $stepId}")
      logger.info(response.toString)
    }
  }

  override def handleMissingYarnStatusForJobStatusSubmitting(jobInstance: JobInstance, updateJob: JobInstance => Future[Unit])
    (implicit executionContext: ExecutionContext): Future[Unit] = Future {
    // do nothing
  }

  private def getSparkArgs(id: String, jobName: String, jobParameters: SparkInstanceParameters) = {
    val config = sparkConfig.emr
    val sparkSubmitConfs = Map("--deploy-mode" -> "cluster")
    val confs = Map("spark.yarn.tags" -> id) ++
      config.additionalConfs ++
      jobParameters.additionalSparkConfig ++
      mergeAdditionalSparkConfig(config.additionalConfs, jobParameters.additionalSparkConfig)
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
}
