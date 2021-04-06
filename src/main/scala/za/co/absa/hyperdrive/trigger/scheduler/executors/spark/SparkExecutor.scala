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

import za.co.absa.hyperdrive.trigger.models.{JobInstance, JobParameters}

import scala.concurrent.{ExecutionContext, Future}
import java.util.UUID.randomUUID

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer

import scala.collection.JavaConverters._
import org.apache.spark.launcher.SparkLauncher
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.ahc.StandaloneAhcWSClient
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses._
import za.co.absa.hyperdrive.trigger.scheduler.executors.Executor
import za.co.absa.hyperdrive.trigger.scheduler.utilities.SparkExecutorConfig
import za.co.absa.hyperdrive.trigger.scheduler.utilities.JobDefinitionConfig.{KeysToMerge, MergedValuesSeparator}
import play.api.libs.ws.JsonBodyReadables._
import za.co.absa.hyperdrive.trigger.scheduler.executors.spark.{FinalStatuses => YarnFinalStatuses}
import org.slf4j.LoggerFactory

object SparkExecutor extends Executor {
  private val wsClient = StandaloneAhcWSClient()(ActorMaterializer()(ActorSystem()))

  override def execute(jobInstance: JobInstance, updateJob: JobInstance => Future[Unit])
                      (implicit executionContext: ExecutionContext): Future[Unit] = {
    jobInstance.executorJobId match {
      case None => submitJob(jobInstance, updateJob)
      case Some(executorJobId) => updateJobStatus(executorJobId, jobInstance, updateJob)
    }
  }

  private def submitJob(jobInstance: JobInstance, updateJob: JobInstance => Future[Unit])
                       (implicit executionContext: ExecutionContext): Future[Unit] = {
    val id = randomUUID().toString
    val ji = jobInstance.copy(executorJobId = Some(id), jobStatus = Submitting)
    updateJob(ji).map { _ =>
      val running = getSparkLauncher(id, ji.jobName, ji.jobParameters).launch()
      Thread.sleep(SparkExecutorConfig.getSubmitTimeOut)
      running.destroyForcibly()
    }
  }

  private def updateJobStatus(executorJobId: String, jobInstance: JobInstance, updateJob: JobInstance => Future[Unit])
                             (implicit executionContext: ExecutionContext): Future[Unit] = {
    wsClient.url(getStatusUrl(executorJobId)).get().map { response =>
      (Json.fromJson[AppsResponse](response.body[JsValue]).asOpt match {
        case Some(asd) => asd.apps.app
        case None => Seq.empty
      }) match {
        case Seq(first) => updateJob(jobInstance.copy(
          applicationId = Some(first.id),
          jobStatus = getStatus(first.finalStatus)))
        case _ if jobInstance.jobStatus == Submitting => updateJob(jobInstance.copy(jobStatus = SubmissionTimeout))
        case _ => updateJob(jobInstance.copy(jobStatus = Lost))
      }
    }
  }

  private def getSparkLauncher(id: String, jobName: String, jobParameters: JobParameters): SparkLauncher = {
    val sparkParameters = SparkParameters(jobParameters)

    val sparkLauncher = new SparkLauncher(Map(
      "HADOOP_CONF_DIR" -> SparkExecutorConfig.getHadoopConfDir,
      "SPARK_PRINT_LAUNCH_COMMAND" -> "1"
    ).asJava)
      .setMaster(SparkExecutorConfig.getMaster)
      .setDeployMode(sparkParameters.deploymentMode)
      .setMainClass(sparkParameters.mainClass)
      .setAppResource(sparkParameters.jobJar)
      .setSparkHome(SparkExecutorConfig.getSparkHome)
      .setAppName(jobName)
      .setConf("spark.yarn.tags", id)
      .addAppArgs(sparkParameters.appArguments.toSeq:_*)
      .addSparkArg("--verbose")
      .redirectToLog(LoggerFactory.getLogger(s"SparkExecutor.executorJobId=$id").getName)
    SparkExecutorConfig.getFilesToDeploy.foreach(file => sparkLauncher.addFile(file))
    SparkExecutorConfig.getAdditionalConfs.foreach(conf => sparkLauncher.setConf(conf._1, conf._2))
    sparkParameters.additionalJars.foreach(additionalJar => sparkLauncher.addJar(additionalJar))
    sparkParameters.additionalFiles.foreach(additionalFile => sparkLauncher.addFile(additionalFile))
    sparkParameters.additionalSparkConfig.foreach(conf => sparkLauncher.setConf(conf._1, conf._2))
    mergeAdditionalSparkConfig(SparkExecutorConfig.getAdditionalConfs, sparkParameters.additionalSparkConfig)
        .foreach(conf => sparkLauncher.setConf(conf._1, conf._2))

    sparkLauncher
  }

  private def mergeAdditionalSparkConfig(globalConfig: Map[String, String], jobConfig: Map[String, String]) =
    KeysToMerge.map(key => {
      val globalValue = globalConfig.getOrElse(key, "")
      val jobValue = jobConfig.getOrElse(key, "")
      key -> s"$globalValue$MergedValuesSeparator$jobValue".trim
    }).toMap

  private def getStatusUrl(executorJobId: String): String = {
    s"${SparkExecutorConfig.getHadoopResourceManagerUrlBase}/ws/v1/cluster/apps?applicationTags=$executorJobId"
  }

  private def getStatus(finalStatus: String): JobStatus = {
    finalStatus match {
      case fs if fs == YarnFinalStatuses.Undefined.name => Running
      case fs if fs == YarnFinalStatuses.Succeeded.name => Succeeded
      case fs if fs == YarnFinalStatuses.Failed.name => Failed
      case fs if fs == YarnFinalStatuses.Killed.name => Killed
      case _ => Lost
    }
  }

}
