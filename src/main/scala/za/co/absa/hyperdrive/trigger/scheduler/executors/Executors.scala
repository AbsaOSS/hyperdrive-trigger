package za.co.absa.hyperdrive.trigger.scheduler.executors

import java.util.concurrent

import za.co.absa.hyperdrive.trigger.models.JobInstance
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.InvalidExecutor
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.persistance.JobInstanceRepository
import za.co.absa.hyperdrive.trigger.scheduler.executors.spark.SparkExecutor
import za.co.absa.hyperdrive.trigger.scheduler.utilities.ExecutorsConfig
import org.slf4j.LoggerFactory

import scala.concurrent.{ExecutionContext, ExecutionContextExecutor, Future}
import scala.util.{Failure, Success}

class Executors(jobInstanceRepository: JobInstanceRepository) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  private implicit val executionContext: ExecutionContextExecutor =
    ExecutionContext.fromExecutor(concurrent.Executors.newFixedThreadPool(ExecutorsConfig.getThreadPoolSize))

  def executeJob(jobInstance: JobInstance): Future[Unit] = {
    val fut = jobInstance.jobType match {
      case JobTypes.Spark => SparkExecutor.execute(jobInstance, updateJob)
      case _ => updateJob(jobInstance.copy(jobStatus = InvalidExecutor))
    }
    fut.onComplete {
      case Success(_) => logger.debug(s"Executing job. Job instance id = ${jobInstance.id}")
      case Failure(exception) => {
        logger.debug(s"Executing job failed. Job instance id = ${jobInstance.id}.", exception)}
    }
    fut
  }

  private def updateJob(jobInstance: JobInstance): Future[Unit] = {
    jobInstanceRepository.updateJob(jobInstance)
  }

}
