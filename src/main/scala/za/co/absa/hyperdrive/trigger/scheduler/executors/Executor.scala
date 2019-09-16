package za.co.absa.hyperdrive.trigger.scheduler.executors

import za.co.absa.hyperdrive.trigger.models.JobInstance

import scala.concurrent.{ExecutionContext, Future}

trait Executor {
  def execute(jobInstance: JobInstance, updateJob: JobInstance => Future[Unit])(implicit executionContext: ExecutionContext): Future[Unit]
}
