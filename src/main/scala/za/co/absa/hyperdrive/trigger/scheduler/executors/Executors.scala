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

package za.co.absa.hyperdrive.trigger.scheduler.executors

import com.typesafe.scalalogging.LazyLogging

import java.time.LocalDateTime
import java.util.concurrent
import javax.inject.Inject
import za.co.absa.hyperdrive.trigger.models.{DagInstance, JobInstance, ShellInstanceParameters, SparkInstanceParameters}
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.InvalidExecutor
import za.co.absa.hyperdrive.trigger.models.enums.{DagInstanceStatuses, JobStatuses, JobTypes}
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, JobInstanceRepository}
import za.co.absa.hyperdrive.trigger.scheduler.executors.spark.{
  HyperdriveExecutor,
  SparkClusterService,
  SparkEmrClusterServiceImpl,
  SparkExecutor,
  SparkYarnClusterServiceImpl
}
import org.springframework.beans.factory.BeanFactory
import org.springframework.context.annotation.Lazy
import za.co.absa.hyperdrive.trigger.scheduler.executors.shell.ShellExecutor
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.api.rest.services.HyperdriveOffsetService
import za.co.absa.hyperdrive.trigger.configuration.application.{SchedulerConfig, SparkConfig}
import za.co.absa.hyperdrive.trigger.scheduler.notifications.NotificationSender

import scala.concurrent.{ExecutionContext, ExecutionContextExecutor, Future}
import scala.util.{Failure, Success}

@Component
class Executors @Inject() (
  dagInstanceRepository: DagInstanceRepository,
  jobInstanceRepository: JobInstanceRepository,
  notificationSender: NotificationSender,
  beanFactory: BeanFactory,
  implicit val sparkConfig: SparkConfig,
  schedulerConfig: SchedulerConfig,
  @Lazy hyperdriveOffsetComparisonService: HyperdriveOffsetService
) extends LazyLogging {
  private implicit val executionContext: ExecutionContextExecutor =
    ExecutionContext.fromExecutor(concurrent.Executors.newFixedThreadPool(schedulerConfig.executors.threadPoolSize))
  private val sparkClusterService: SparkClusterService = {
    sparkConfig.submitApi.toLowerCase match {
      case "yarn" =>
        logger.info(s"Using yarn cluster")
        beanFactory.getBean(classOf[SparkYarnClusterServiceImpl])
      case "emr" =>
        logger.info(s"Using emr cluster")
        beanFactory.getBean(classOf[SparkEmrClusterServiceImpl])
      case _ => throw new IllegalArgumentException("Invalid spark cluster api - use one of: yarn, emr")
    }
  }

  def executeDag(dagInstance: DagInstance): Future[Unit] =
    jobInstanceRepository.getJobInstances(dagInstance.id).flatMap {
      case jobInstances if jobInstances.exists(_.jobStatus.isFailed) =>
        val updatedDagInstance =
          dagInstance.copy(status = DagInstanceStatuses.Failed, finished = Option(LocalDateTime.now()))
        val fut = for {
          _ <- jobInstanceRepository
            .updateJobsStatus(jobInstances.filter(!_.jobStatus.isFinalStatus).map(_.id), JobStatuses.FailedPreviousJob)
          _ <- dagInstanceRepository.update(updatedDagInstance)
          _ <- notificationSender.createNotifications(updatedDagInstance, jobInstances)
        } yield {}
        fut.onComplete {
          case Failure(exception) =>
            logger.error(s"Updating status failed for failed run. (DagId=${dagInstance.id})", exception)
          case _ =>
            logger.info("Updating status succeeded for failed run. (DagId={})", dagInstance.id)
        }
        fut
      case jobInstances
          if jobInstances.forall(ji => ji.jobStatus.isFinalStatus && ji.jobStatus == JobStatuses.NoData) =>
        val updatedDagInstance =
          dagInstance.copy(status = DagInstanceStatuses.Skipped, finished = Option(LocalDateTime.now()))
        val fut = for {
          _ <- dagInstanceRepository.update(updatedDagInstance)
        } yield {}
        fut.onComplete {
          case Failure(exception) =>
            logger.error(s"Updating status failed for skipped run. (DagId=${dagInstance.id})", exception)
          case _ =>
            logger.info("Updating status succeeded for skipped run. (DagId={})", dagInstance.id)
        }
        fut
      case jobInstances if jobInstances.forall(ji => ji.jobStatus.isFinalStatus && !ji.jobStatus.isFailed) =>
        val updatedDagInstance =
          dagInstance.copy(status = DagInstanceStatuses.Succeeded, finished = Option(LocalDateTime.now()))
        val fut = for {
          _ <- dagInstanceRepository.update(updatedDagInstance)
          _ <- notificationSender.createNotifications(updatedDagInstance, jobInstances)
        } yield {}
        fut.onComplete {
          case Failure(exception) =>
            logger.error(s"Updating status failed for successful run. (DagId=${dagInstance.id})", exception)
          case _ =>
            logger.info("Updating status succeeded for successful run. (DagId={})", dagInstance.id)
        }
        fut
      case jobInstances =>
        val jobInstance = jobInstances.filter(!_.jobStatus.isFinalStatus).sortBy(_.order).headOption
        val fut = dagInstanceRepository.update(dagInstance.copy(status = DagInstanceStatuses.Running)).flatMap { _ =>
          jobInstance match {
            case Some(ji) =>
              ji.jobParameters match {
                case hyperdrive: SparkInstanceParameters if hyperdrive.jobType == JobTypes.Hyperdrive =>
                  HyperdriveExecutor
                    .execute(ji, hyperdrive, updateJob, sparkClusterService, hyperdriveOffsetComparisonService)
                case spark: SparkInstanceParameters => SparkExecutor.execute(ji, spark, updateJob, sparkClusterService)
                case shell: ShellInstanceParameters => ShellExecutor.execute(ji, shell, updateJob)
                case _                              => updateJob(ji.copy(jobStatus = InvalidExecutor))
              }
            case None =>
              Future.successful((): Unit)
          }
        }
        fut.onComplete {
          case Success(_) => logger.debug(s"Executing job. (JobInstance={})", jobInstance)
          case Failure(exception) =>
            logger.error(s"Executing job failed. (JobInstance=$jobInstance).", exception)
        }
        fut
    }

  private def updateJob(jobInstance: JobInstance): Future[Unit] = {
    logger.info(
      "Job updated. (JobInstance={}) STATUS = {} EXECUTOR_ID = {}",
      jobInstance.id,
      jobInstance.jobStatus,
      jobInstance.executorJobId
    )
    jobInstanceRepository.updateJob(jobInstance)
  }

}
