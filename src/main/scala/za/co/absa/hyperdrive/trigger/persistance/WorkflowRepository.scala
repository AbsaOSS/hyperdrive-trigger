package za.co.absa.hyperdrive.trigger.persistance

import java.time.LocalDateTime

import za.co.absa.hyperdrive.trigger.models.{Sensor, JobDefinition, Workflow, WorkflowJoined}
import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._

import scala.concurrent.{ExecutionContext, Future}

trait WorkflowRepository extends Repository {
  def insertWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Unit]
  def getWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Option[(Workflow, Sensor, JobDefinition)]]
  def getWorkflows()(implicit ec: ExecutionContext): Future[Seq[Workflow]]
  def deleteWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Unit]
  def updateWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Unit]
  def updateWorkflowActiveState(id: Long, isActive: Boolean)(implicit ec: ExecutionContext): Future[Unit]
}

class WorkflowRepositoryImpl extends WorkflowRepository {

  override def insertWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Unit] = db.run(
    (for {
      workflowId <- workflowTable returning workflowTable.map(_.id) += workflow.toWorkflow.copy(created = LocalDateTime.now())
      sensorId <- sensorTable += workflow.sensor.copy(workflowId = workflowId)
      jobDefinitionId <- jobDefinitionTable += workflow.job.copy(workflowId = workflowId)
    } yield ()).transactionally
  )

  override def getWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Option[(Workflow, Sensor, JobDefinition)]] = db.run(
    (for {
      w <- workflowTable if w.id === id
      s <- sensorTable if s.workflowId === id
      jd <- jobDefinitionTable if jd.workflowId === id
    } yield {
      (w, s, jd)
    }).result.headOption
  )

  override def getWorkflows()(implicit ec: ExecutionContext): Future[Seq[Workflow]] = db.run(
    workflowTable.sortBy(_.name).result
  )

  override def deleteWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Unit] = db.run(
    (for {
      jd <- jobDefinitionTable.filter(_.workflowId === id).delete
      s <- sensorTable.filter(_.workflowId === id).delete
      w <-  workflowTable.filter(_.id === id).delete
    } yield ()).transactionally
  )

  override def updateWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Unit] = db.run(
    DBIO.seq(for {
      w <- workflowTable.filter(_.id === workflow.id).update(workflow.toWorkflow.copy(updated = Option(LocalDateTime.now())))
      st <- sensorTable.filter(_.id === workflow.sensor.id).update(workflow.sensor)
      jd <- jobDefinitionTable.filter(_.id === workflow.job.id).update(workflow.job)
    } yield {
      if(w == 1 && st == 1 && jd == 1) {
        DBIO.successful((): Unit)
      } else {
        DBIO.failed(new Exception("Update workflow exception"))
      }
    }).transactionally
  )

  override def updateWorkflowActiveState(id: Long, isActive: Boolean)(implicit ec: ExecutionContext): Future[Unit] = db.run(
    for {
      w <- workflowTable.filter(_.id === id)
        .map(workflow => (workflow.isActive, workflow.updated)).update((isActive, Option(LocalDateTime.now())))
    } yield {
      if(w == 1) {
        DBIO.successful((): Unit)
      } else {
        DBIO.failed(new Exception("Update workflow exception"))
      }
    }.transactionally
  )

}