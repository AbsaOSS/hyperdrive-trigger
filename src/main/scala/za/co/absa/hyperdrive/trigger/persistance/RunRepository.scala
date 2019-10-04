package za.co.absa.hyperdrive.trigger.persistance

import za.co.absa.hyperdrive.trigger.models.{OverallStatistics, PerDagStatistics, PerWorkflowStatistics}
import za.co.absa.hyperdrive.trigger.models.tables.JdbcTypeMapper._
import za.co.absa.hyperdrive.trigger.models.enums.{DagInstanceStatuses, JobStatuses}
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.{InQueue, Succeeded}
import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._

import scala.concurrent.{ExecutionContext, Future}

trait RunRepository extends Repository {
  def getOverallStatistics()(implicit ec: ExecutionContext): Future[OverallStatistics]
  def getPerWorkflowStatistics()(implicit ec: ExecutionContext): Future[Seq[PerWorkflowStatistics]]
  def getPerDagStatistics(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[PerDagStatistics]]
}

class RunRepositoryImpl extends RunRepository {

  override def getOverallStatistics()(implicit ec: ExecutionContext): Future[OverallStatistics] = db.run {
    (
      jobInstanceTable.filter(_.jobStatus.inSet(Seq(Succeeded))).size,
      jobInstanceTable.filter(_.jobStatus.inSet(JobStatuses.statuses.filter(_.isFailed))).size,
      jobInstanceTable.filter(_.jobStatus.inSet(JobStatuses.statuses.filter(_.isRunning))).size,
      jobInstanceTable.filter(_.jobStatus.inSet(Seq(InQueue))).size
    ).result.map((OverallStatistics.apply _).tupled(_))
  }

  override def getPerWorkflowStatistics()(implicit ec: ExecutionContext): Future[Seq[PerWorkflowStatistics]] = {
    db.run {(
      for {
        workflow <- workflowTable
      } yield {
        val dagInstances = dagInstanceTable.filter(_.workflowId === workflow.id)
        (
          workflow.id,
          workflow.name,
          workflow.isActive,
          dagInstances.size,
          dagInstances.filter(_.status.inSet(Seq(DagInstanceStatuses.Succeeded))).size,
          dagInstances.filter(_.status.inSet(DagInstanceStatuses.statuses.filter(_.isFailed))).size,
          dagInstances.filter(_.status.inSet(Seq(DagInstanceStatuses.InQueue))).size,
          dagInstances.filter(_.status.inSet(DagInstanceStatuses.statuses.filter(_.isRunning))).size
        )
      }).sortBy(_._2).result
    }.map(_.map((PerWorkflowStatistics.apply _).tupled(_)))
  }

  override def getPerDagStatistics(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[PerDagStatistics]] = {
    db.run {(
      for {
        dag <- dagInstanceTable if dag.workflowId === workflowId
      } yield {
        val jobInstances = jobInstanceTable.filter(_.dagInstanceId === dag.id)
        (
          dag.id,
          jobInstances.size,
          jobInstances.filter(_.jobStatus.inSet(Seq(Succeeded))).size,
          jobInstances.filter(_.jobStatus.inSet(JobStatuses.statuses.filter(_.isFailed))).size,
          jobInstances.filter(_.jobStatus.inSet(Seq(JobStatuses.InQueue))).size,
          jobInstances.filter(_.jobStatus.inSet(JobStatuses.statuses.filter(_.isRunning))).size
        )
      }).sortBy(_._1).result
    }.map(_.map((PerDagStatistics.apply _).tupled(_)))
  }

}