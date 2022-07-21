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

import org.apache.spark.launcher.{
  InProcessLauncher,
  NoBackendConnectionInProcessLauncher,
  SparkAppHandle,
  SparkLauncher
}
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.configuration.application.SparkConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.{Lost, SubmissionTimeout, Submitting}
import za.co.absa.hyperdrive.trigger.models.{JobInstance, SparkInstanceParameters}
import za.co.absa.hyperdrive.trigger.api.rest.utils.Extensions._

import java.util.UUID.randomUUID
import java.util.concurrent.{CountDownLatch, TimeUnit}
import javax.inject.Inject
import scala.concurrent.{ExecutionContext, Future}

@Service
class SparkYarnClusterServiceImpl @Inject() (
  implicit sparkConfig: SparkConfig,
  executionContextProvider: SparkClusterServiceExecutionContextProvider
) extends SparkClusterService {
  private implicit val executionContext: ExecutionContext = executionContextProvider.get()

  override def submitJob(
    jobInstance: JobInstance,
    jobParameters: SparkInstanceParameters,
    updateJob: JobInstance => Future[Unit]
  ): Future[Unit] = {
    val id = randomUUID().toString
    val ji = jobInstance.copy(executorJobId = Some(id), jobStatus = Submitting)
    updateJob(ji).map { _ =>
      val submitTimeout = sparkConfig.yarn.submitTimeout
      val latch = new CountDownLatch(1)
      val sparkAppHandle =
        getSparkLauncher(id, ji.jobName, jobParameters).startApplication(new SparkAppHandle.Listener {
          import scala.math.Ordered.orderingToOrdered
          override def stateChanged(handle: SparkAppHandle): Unit =
            if (handle.getState >= SparkAppHandle.State.SUBMITTED) {
              latch.countDown()
            }
          override def infoChanged(handle: SparkAppHandle): Unit = {
            // do nothing
          }
        })
      latch.await(submitTimeout, TimeUnit.MILLISECONDS)
      sparkAppHandle.kill()
    }
  }

  override def handleMissingYarnStatus(
    jobInstance: JobInstance,
    updateJob: JobInstance => Future[Unit]
  ): Future[Unit] = {
    val status = jobInstance.jobStatus match {
      case s if s == Submitting => SubmissionTimeout
      case _                    => Lost
    }

    updateJob(jobInstance.copy(jobStatus = status))
  }

  private def getSparkLauncher(id: String, jobName: String, jobParameters: SparkInstanceParameters)(
    implicit sparkConfig: SparkConfig
  ): InProcessLauncher = {
    val config = sparkConfig.yarn
    val sparkLauncher = new NoBackendConnectionInProcessLauncher()
      .setMaster(config.master)
      .setDeployMode("cluster")
      .setMainClass(jobParameters.mainClass)
      .setAppResource(jobParameters.jobJar)
      .setAppName(jobName)
      .setConf("spark.app.name", jobName)
      .addAppArgs(jobParameters.appArguments.toSeq.map(fix_json_for_yarn): _*)
      .addSparkArg("--verbose")
    config.filesToDeploy.foreach(file => sparkLauncher.addFile(file))
    config.additionalConfs.foreach(conf => sparkLauncher.setConf(conf._1, conf._2))
    jobParameters.additionalJars.foreach(sparkLauncher.addJar)
    jobParameters.additionalFiles.foreach(sparkLauncher.addFile)
    jobParameters.additionalSparkConfig.foreach(conf => sparkLauncher.setConf(conf.key, conf.value))
    mergeAdditionalSparkConfig(
      config.additionalConfs ++ Map("spark.yarn.tags" -> id),
      jobParameters.additionalSparkConfig.toKeyValueMap
    ).foreach(conf => sparkLauncher.setConf(conf._1, conf._2))

    sparkLauncher
  }

  /*
    Fixed inspired by https://stackoverflow.com/questions/43040793/scala-via-spark-with-yarn-curly-brackets-string-missing
    See https://issues.apache.org/jira/browse/SPARK-17814
    Due to YARN bug above, we need to replace all occurrences of {{ or }}, with { { or } }
   */
  private def fix_json_for_yarn(arg: String): String =
    arg.replace("}}", "} }").replace("{{", "{ {")
}
