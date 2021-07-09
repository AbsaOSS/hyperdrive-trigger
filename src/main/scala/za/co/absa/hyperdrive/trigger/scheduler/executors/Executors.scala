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

import java.time.LocalDateTime
import java.util.concurrent
import javax.inject.Inject
import za.co.absa.hyperdrive.trigger.models.{DagInstance, JobInstance, ShellInstanceParameters, SparkInstanceParameters}
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.InvalidExecutor
import za.co.absa.hyperdrive.trigger.models.enums.{DagInstanceStatuses, JobStatuses}
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, JobInstanceRepository}
import za.co.absa.hyperdrive.trigger.scheduler.executors.spark.SparkExecutor
import za.co.absa.hyperdrive.trigger.scheduler.utilities.ExecutorsConfig
import org.slf4j.LoggerFactory
import za.co.absa.hyperdrive.trigger.scheduler.executors.shell.ShellExecutor
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.scheduler.notifications.NotificationSender

import scala.concurrent.{ExecutionContext, ExecutionContextExecutor, Future}
import scala.util.{Failure, Success}

@Component
class Executors @Inject()(dagInstanceRepository: DagInstanceRepository, jobInstanceRepository: JobInstanceRepository,
                          notificationSender: NotificationSender) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  private implicit val executionContext: ExecutionContextExecutor =
    ExecutionContext.fromExecutor(concurrent.Executors.newFixedThreadPool(ExecutorsConfig.getThreadPoolSize))

  def executeDag(dagInstance: DagInstance): Future[Unit] = {
    jobInstanceRepository.getJobInstances(dagInstance.id).flatMap {
      case jobInstances if jobInstances.exists(_.jobStatus.isFailed) =>
        val updatedDagInstance = dagInstance.copy(status = DagInstanceStatuses.Failed, finished = Option(LocalDateTime.now()))
        val fut = for {
          _ <- jobInstanceRepository.updateJobsStatus(jobInstances.filter(!_.jobStatus.isFinalStatus).map(_.id), JobStatuses.FailedPreviousJob)
          _ <- dagInstanceRepository.update(updatedDagInstance)
          _ <- notificationSender.sendNotifications(updatedDagInstance, jobInstances)
        } yield {}
        fut.onComplete {
          case Failure(exception) => logger.error(s"Updating status failed for failed run. Dag instance id = ${dagInstance.id}", exception)
          case _ =>
        }
        fut
      case jobInstances if jobInstances.forall(ji => ji.jobStatus.isFinalStatus && !ji.jobStatus.isFailed) =>
        val updatedDagInstance = dagInstance.copy(status = DagInstanceStatuses.Succeeded, finished = Option(LocalDateTime.now()))
        val fut = for {
          _ <- dagInstanceRepository.update(updatedDagInstance)
          _ <- notificationSender.sendNotifications(updatedDagInstance, jobInstances)
        } yield {}
        fut.onComplete {
          case Failure(exception) => logger.error(s"Updating status failed for successful run. Dag instance id = ${dagInstance.id}", exception)
          case _ =>
        }
        fut
      case jobInstances =>
        val jobInstance = jobInstances.filter(!_.jobStatus.isFinalStatus).sortBy(_.order).headOption
        val fut = dagInstanceRepository.update(dagInstance.copy(status = DagInstanceStatuses.Running)).flatMap { _ =>
          jobInstance match {
            case Some(ji) => ji.jobParameters match {
              case spark: SparkInstanceParameters => SparkExecutor.execute(ji, spark, updateJob)
              case shell: ShellInstanceParameters => ShellExecutor.execute(ji, shell, updateJob)
              case _ => updateJob(ji.copy(jobStatus = InvalidExecutor))
            }
            case None =>
              Future.successful((): Unit)
          }
        }
        fut.onComplete {
          case Success(_) => logger.debug(s"Executing job. Job instance id = ${jobInstance}")
          case Failure(exception) => {
            logger.error(s"Executing job failed. Job instance id = ${jobInstance}.", exception)
          }
        }
        fut
    }
  }

  private def updateJob(jobInstance: JobInstance): Future[Unit] = {
    jobInstanceRepository.updateJob(jobInstance)
  }

}
