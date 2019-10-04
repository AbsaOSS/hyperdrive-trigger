package za.co.absa.hyperdrive.trigger.scheduler.executors

import java.util.concurrent

import za.co.absa.hyperdrive.trigger.models.{DagInstance, JobInstance}
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.InvalidExecutor
import za.co.absa.hyperdrive.trigger.models.enums.{DagInstanceStatuses, JobStatuses, JobTypes}
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, JobInstanceRepository}
import za.co.absa.hyperdrive.trigger.scheduler.executors.spark.SparkExecutor
import za.co.absa.hyperdrive.trigger.scheduler.utilities.ExecutorsConfig
import org.slf4j.LoggerFactory

import scala.concurrent.{ExecutionContext, ExecutionContextExecutor, Future}
import scala.util.{Failure, Success}

class Executors(dagInstanceRepository: DagInstanceRepository, jobInstanceRepository: JobInstanceRepository) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  private implicit val executionContext: ExecutionContextExecutor =
    ExecutionContext.fromExecutor(concurrent.Executors.newFixedThreadPool(ExecutorsConfig.getThreadPoolSize))

  def executeDag(dagInstance: DagInstance): Future[Unit] = {
    jobInstanceRepository.getJobInstances(dagInstance.id).flatMap {
      case jobInstances if jobInstances.exists(_.jobStatus.isFailed) =>
        jobInstanceRepository.updateJobsStatus(jobInstances.filter(!_.jobStatus.isFinalStatus).map(_.id), JobStatuses.FailedPreviousJob).flatMap(_=>
          dagInstanceRepository.update(dagInstance.copy(status = DagInstanceStatuses.Failed))
        )
      case jobInstances if jobInstances.forall(ji => ji.jobStatus.isFinalStatus && !ji.jobStatus.isFailed) =>
        dagInstanceRepository.update(dagInstance.copy(status = DagInstanceStatuses.Succeeded))
      case jobInstances =>
        val jobInstance = jobInstances.filter(!_.jobStatus.isFinalStatus).sortBy(_.order).headOption
        val fut = dagInstanceRepository.update(dagInstance.copy(status = DagInstanceStatuses.Running)).flatMap { _ =>
          jobInstance match {
            case Some(ji) => ji.jobType match {
              case JobTypes.Spark => SparkExecutor.execute(ji, updateJob)
              case _ => updateJob(ji.copy(jobStatus = InvalidExecutor))
            }
            case None =>
              Future.successful((): Unit)
          }
        }
        fut.onComplete {
          case Success(_) => logger.info(s"Executing job. Job instance id = ${jobInstance}")
          case Failure(exception) => {
            logger.info(s"Executing job failed. Job instance id = ${jobInstance}.", exception)}
        }
        fut
    }
  }

  private def updateJob(jobInstance: JobInstance): Future[Unit] = {
    jobInstanceRepository.updateJob(jobInstance)
  }

}
