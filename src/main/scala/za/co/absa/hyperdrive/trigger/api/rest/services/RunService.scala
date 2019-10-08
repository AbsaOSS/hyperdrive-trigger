package za.co.absa.hyperdrive.trigger.api.rest.services

import za.co.absa.hyperdrive.trigger.models.{OverallStatistics, PerDagStatistics, PerProjectStatistics, PerWorkflowStatistics}
import za.co.absa.hyperdrive.trigger.persistance.RunRepository

import scala.concurrent.{ExecutionContext, Future}

trait RunService {
  val runRepository: RunRepository
  def getOverallStatistics()(implicit ec: ExecutionContext): Future[OverallStatistics]
  def getPerDagStatistics(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[PerDagStatistics]]
  def getPerProjectStatistics()(implicit ec: ExecutionContext): Future[Seq[PerProjectStatistics]]
  def getPerWorkflowStatistics(projectName: String)(implicit ec: ExecutionContext): Future[Seq[PerWorkflowStatistics]]
}

class RunServiceImpl(override val runRepository: RunRepository) extends RunService {

  override def getOverallStatistics()(implicit ec: ExecutionContext): Future[OverallStatistics] = {
    runRepository.getOverallStatistics()
  }

  override def getPerDagStatistics(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[PerDagStatistics]] = {
    runRepository.getPerDagStatistics(workflowId)
  }

  override def getPerProjectStatistics()(implicit ec: ExecutionContext): Future[Seq[PerProjectStatistics]] = {
    runRepository.getPerProjectStatistics()
  }

  override def getPerWorkflowStatistics(projectName: String)(implicit ec: ExecutionContext): Future[Seq[PerWorkflowStatistics]] = {
    runRepository.getPerWorkflowStatistics(projectName)
  }

}
