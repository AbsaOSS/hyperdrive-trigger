
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

import org.apache.spark.launcher.{SparkAppHandle, SparkLauncher}
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.configuration.application.SparkConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.Submitting
import za.co.absa.hyperdrive.trigger.models.{JobInstance, SparkInstanceParameters}

import java.util.UUID.randomUUID
import java.util.concurrent.{CountDownLatch, TimeUnit}
import javax.inject.Inject
import scala.concurrent.{ExecutionContext, Future}

@Service
class SparkYarnClusterServiceImpl @Inject()(implicit sparkConfig: SparkConfig) extends SparkClusterService {
  override def submitJob(jobInstance: JobInstance, jobParameters: SparkInstanceParameters, updateJob: JobInstance => Future[Unit])
                        (implicit executionContext: ExecutionContext): Future[Unit] = {
    val id = randomUUID().toString
    val ji = jobInstance.copy(executorJobId = Some(id), jobStatus = Submitting)
    updateJob(ji).map { _ =>
      val submitTimeout = sparkConfig.yarn.submitTimeout
      val latch = new CountDownLatch(1)
      val sparkAppHandle = getSparkLauncher(id, ji.jobName, jobParameters).startApplication(new SparkAppHandle.Listener {
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

  private def getSparkLauncher(id: String, jobName: String, jobParameters: SparkInstanceParameters)
                              (implicit sparkConfig: SparkConfig): SparkLauncher = {
    import scala.collection.JavaConverters._
    val config = sparkConfig.yarn
    val sparkLauncher = new SparkLauncher(Map(
      "HADOOP_CONF_DIR" -> config.hadoopConfDir,
      "SPARK_PRINT_LAUNCH_COMMAND" -> "1"
    ).asJava)
      .setMaster(config.master)
      .setDeployMode("cluster")
      .setMainClass(jobParameters.mainClass)
      .setAppResource(jobParameters.jobJar)
      .setSparkHome(config.sparkHome)
      .setAppName(jobName)
      .setConf("spark.yarn.tags", id)
      .addAppArgs(jobParameters.appArguments.toSeq:_*)
      .addSparkArg("--verbose")
      .redirectToLog(LoggerFactory.getLogger(s"SparkExecutor.executorJobId=$id").getName)
    config.filesToDeploy.foreach(file => sparkLauncher.addFile(file))
    config.additionalConfs.foreach(conf => sparkLauncher.setConf(conf._1, conf._2))
    jobParameters.additionalJars.foreach(sparkLauncher.addJar)
    jobParameters.additionalFiles.foreach(sparkLauncher.addFile)
    jobParameters.additionalSparkConfig.foreach(conf => sparkLauncher.setConf(conf._1, conf._2))
    mergeAdditionalSparkConfig(config.additionalConfs, jobParameters.additionalSparkConfig)
      .foreach(conf => sparkLauncher.setConf(conf._1, conf._2))

    sparkLauncher
  }
}
