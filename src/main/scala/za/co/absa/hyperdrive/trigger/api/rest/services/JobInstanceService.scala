package za.co.absa.hyperdrive.trigger.api.rest.services

import za.co.absa.hyperdrive.trigger.models.JobInstance
import za.co.absa.hyperdrive.trigger.persistance.JobInstanceRepository
import scala.concurrent.{ExecutionContext, Future}

trait JobInstanceService {
  val jobInstanceRepository: JobInstanceRepository
  def getJobInstances(dagInstanceId: Long)(implicit ec: ExecutionContext): Future[Seq[JobInstance]]
}

class JobInstanceServiceImpl(override val jobInstanceRepository: JobInstanceRepository) extends JobInstanceService {

  override def getJobInstances(dagInstanceId: Long)(implicit ec: ExecutionContext): Future[Seq[JobInstance]] = {
    jobInstanceRepository.getJobInstances(dagInstanceId)
  }

}
