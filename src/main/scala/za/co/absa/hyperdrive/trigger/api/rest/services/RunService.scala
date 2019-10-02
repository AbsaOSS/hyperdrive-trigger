package za.co.absa.hyperdrive.trigger.api.rest.services

import za.co.absa.hyperdrive.trigger.models.{OverallStatistics, PerDagStatistics, PerWorkflowStatistics}
import za.co.absa.hyperdrive.trigger.persistance.RunRepository

import scala.concurrent.{ExecutionContext, Future}

trait RunService {
  val runRepository: RunRepository
  def getOverallStatistics()(implicit ec: ExecutionContext): Future[OverallStatistics]
  def getPerWorkflowStatistics()(implicit ec: ExecutionContext): Future[Seq[PerWorkflowStatistics]]
  def getPerDagStatistics(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[PerDagStatistics]]
}

class RunServiceImpl(override val runRepository: RunRepository) extends RunService {

  override def getOverallStatistics()(implicit ec: ExecutionContext): Future[OverallStatistics] = {
    runRepository.getOverallStatistics()
  }

  override def getPerWorkflowStatistics()(implicit ec: ExecutionContext): Future[Seq[PerWorkflowStatistics]] = {
    runRepository.getPerWorkflowStatistics()
  }

  override def getPerDagStatistics(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[PerDagStatistics]] = {
    runRepository.getPerDagStatistics(workflowId)
  }

}
