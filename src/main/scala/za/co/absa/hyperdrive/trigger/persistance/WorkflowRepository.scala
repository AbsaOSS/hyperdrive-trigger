package za.co.absa.hyperdrive.trigger.persistance

import java.time.LocalDateTime

import za.co.absa.hyperdrive.trigger.models.{ProjectInfo, _}
import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._

import scala.concurrent.{ExecutionContext, Future}

trait WorkflowRepository extends Repository {
  def insertWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Unit]
  def getWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Option[WorkflowJoined]]
  def getWorkflows()(implicit ec: ExecutionContext): Future[Seq[Workflow]]
  def getWorkflowsByProjectName(projectName: String)(implicit ec: ExecutionContext): Future[Seq[Workflow]]
  def deleteWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Unit]
  def updateWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Unit]
  def updateWorkflowActiveState(id: Long, isActive: Boolean)(implicit ec: ExecutionContext): Future[Unit]
  def getProjects()(implicit ec: ExecutionContext): Future[Seq[String]]
  def getProjectsInfo()(implicit ec: ExecutionContext): Future[Seq[ProjectInfo]]
}

class WorkflowRepositoryImpl extends WorkflowRepository {

  override def insertWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Unit] = db.run(
    (for {
      workflowId <- workflowTable returning workflowTable.map(_.id) += workflow.toWorkflow.copy(created = LocalDateTime.now())
      sensorId <- sensorTable += workflow.sensor.copy(workflowId = workflowId)
      dagId <- dagDefinitionTable returning dagDefinitionTable.map(_.id) += workflow.dagDefinitionJoined.toDag().copy(workflowId = workflowId)
      jobId <- jobDefinitionTable ++= workflow.dagDefinitionJoined.jobDefinitions.map(_.copy(dagDefinitionId = dagId))
    } yield ()).transactionally
  )

  override def getWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Option[WorkflowJoined]] = {
    db.run(
      (for {
      w <- workflowTable if w.id === id
      s <- sensorTable if s.workflowId === id
      dd <- dagDefinitionTable if dd.workflowId === id
      jd <- jobDefinitionTable if jd.dagDefinitionId === dd.id
    } yield {
      (w, s, dd, jd)
    }).result
    ).map { wsddjd =>
      wsddjd.headOption map {
        case (w,s,dd,_) =>
          WorkflowJoined(
            name = w.name,
            isActive = w.isActive,
            project = w.project,
            created = w.created,
            updated = w.updated,
            sensor = s,
            dagDefinitionJoined = DagDefinitionJoined(
              workflowId = dd.workflowId,
              jobDefinitions = wsddjd.map(_._4),
              id = dd.id
            ),
            id = w.id
          )
      }
    }
  }

  override def getWorkflows()(implicit ec: ExecutionContext): Future[Seq[Workflow]] = db.run(
    workflowTable.sortBy(_.name).result
  )

  override def getWorkflowsByProjectName(projectName: String)(implicit ec: ExecutionContext): Future[Seq[Workflow]] = db.run(
    workflowTable.filter(_.project === projectName).sortBy(_.name).result
  )

  override def deleteWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Unit] = {
    val deleteSensor = sensorTable.filter(_.workflowId === id)
    val deleteEvent = eventTable.filter(_.sensorId in deleteSensor.map(_.id))
    val deleteDagIns = dagInstanceTable.filter(_.workflowId === id)
    val deleteDagDef = dagDefinitionTable.filter(_.workflowId === id)
    val deleteJobDef = jobDefinitionTable.filter(_.dagDefinitionId in deleteDagDef.map(_.id))
    val deleteJobIns = jobInstanceTable.filter(_.dagInstanceId in deleteDagIns.map(_.id))
    val deleteWorkflow = workflowTable.filter(_.id === id)
    db.run(
      deleteEvent.delete andThen
        deleteSensor.delete andThen
        deleteJobDef.delete andThen
        deleteJobIns.delete andThen
        deleteDagIns.delete andThen
        deleteDagDef.delete andThen
        deleteWorkflow.delete andThen
        DBIO.successful((): Unit).transactionally
    )
  }

  override def updateWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Unit] = {
    db.run((for {
      w <- workflowTable.filter(_.id === workflow.id).update(workflow.toWorkflow.copy(updated = Option(LocalDateTime.now())))
      s <- sensorTable.filter(_.id === workflow.sensor.id).update(workflow.sensor)
      dd <- dagDefinitionTable.filter(_.workflowId === workflow.id).update(workflow.dagDefinitionJoined.toDag())
      deleteJds <- jobDefinitionTable.filter(_.dagDefinitionId === workflow.dagDefinitionJoined.id).delete
      insertJds <- jobDefinitionTable ++= workflow.dagDefinitionJoined.jobDefinitions.map(_.copy(dagDefinitionId = workflow.dagDefinitionJoined.id))
    } yield {}
      ).transactionally)
  }

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

  override def getProjects()(implicit ec: ExecutionContext): Future[Seq[String]] = db.run(
    workflowTable.map(_.project).distinct.sortBy(_.value).result
  )

  override def getProjectsInfo()(implicit ec: ExecutionContext): Future[Seq[ProjectInfo]] = db.run(
    workflowTable.map(_.project).groupBy(_.value).map(e => (e._1, e._2.length)).sortBy(_._1).result.map(_.map((ProjectInfo.apply _).tupled(_)))
  )

}