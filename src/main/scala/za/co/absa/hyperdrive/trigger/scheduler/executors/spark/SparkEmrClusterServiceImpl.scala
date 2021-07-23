
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

import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.amazonaws.services.elasticmapreduce.AmazonElasticMapReduceClientBuilder
import com.amazonaws.services.elasticmapreduce.model.{ActionOnFailure, AddJobFlowStepsRequest, HadoopJarStepConfig, StepConfig}
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.configuration.application.SparkConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.Submitting
import za.co.absa.hyperdrive.trigger.models.{JobInstance, SparkInstanceParameters}

import java.util.UUID.randomUUID
import scala.concurrent.{ExecutionContext, Future}

@Service
class SparkEmrClusterServiceImpl extends SparkClusterService {
  private val logger = LoggerFactory.getLogger(this.getClass)

  override def submitJob(jobInstance: JobInstance, jobParameters: SparkInstanceParameters, updateJob: JobInstance => Future[Unit])
                        (implicit executionContext: ExecutionContext, sparkConfig: SparkConfig): Future[Unit] = {
    val id = randomUUID().toString
    val ji = jobInstance.copy(executorJobId = Some(id), jobStatus = Submitting)
    updateJob(ji).map { _ =>
      import scala.collection.JavaConverters._
      val stepConfig = new StepConfig()
        .withHadoopJarStep(new HadoopJarStepConfig()
          .withJar("command-runner.jar")
          .withArgs(getSparkArgs(id, ji.jobName, jobParameters):_*)
        )
        .withActionOnFailure(ActionOnFailure.CONTINUE)

      val jobFlowStepsRequest = new AddJobFlowStepsRequest()
        .withJobFlowId(sparkConfig.emr.clusterId)
        .withSteps(Seq(stepConfig).asJava)

      val emrBuilder = AmazonElasticMapReduceClientBuilder.standard()
      val emrWithRegion = sparkConfig.emr.region
        .map(region => emrBuilder.withRegion(region))
        .getOrElse(emrBuilder)
      val emr = sparkConfig.emr.awsProfile
        .map(profile => emrWithRegion.withCredentials(new ProfileCredentialsProvider(profile)))
        .getOrElse(emrWithRegion)
        .build()
      val response = emr.addJobFlowSteps(jobFlowStepsRequest)
      logger.info(s"Added step for executorId ${id} and stepId(s) ${response.getStepIds.asScala.mkString(", ")}")
      logger.info(response.toString)
    }
  }

  private def getSparkArgs(id: String, jobName: String, jobParameters: SparkInstanceParameters)
                          (implicit sparkConfig: SparkConfig) = {
    val config = sparkConfig.emr
    val confs = Map("spark.yarn.tags" -> id) ++
      config.additionalConfs ++
      jobParameters.additionalSparkConfig ++
      mergeAdditionalSparkConfig(config.additionalConfs, jobParameters.additionalSparkConfig)
    val files = config.filesToDeploy ++ jobParameters.additionalFiles
    SparkEmrArgs(
      mainClass = jobParameters.mainClass,
      jobJar = jobParameters.jobJar,
      appName = jobName,
      confs = confs,
      files = files,
      additionalJars = jobParameters.additionalJars,
      sparkArgs = Seq("--verbose"),
      appArgs = jobParameters.appArguments
    ).getArgs
  }
}
