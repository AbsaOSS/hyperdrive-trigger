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

package za.co.absa.hyperdrive.trigger.persistance

import java.time.LocalDateTime

import org.slf4j.LoggerFactory
import org.springframework.stereotype
import za.co.absa.hyperdrive.trigger.models.errors.{ApiError, GenericDatabaseError}
import za.co.absa.hyperdrive.trigger.models.{ProjectInfo, _}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

trait WorkflowRepository extends Repository {
  val workflowHistoryRepository: WorkflowHistoryRepository

  def insertWorkflow(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): Future[Either[ApiError, Long]]
  def existsWorkflow(name: String)(implicit ec: ExecutionContext): Future[Boolean]
  def existsOtherWorkflow(name: String, id: Long)(implicit ec: ExecutionContext): Future[Boolean]
  def getWorkflow(id: Long)(implicit ec: ExecutionContext): Future[WorkflowJoined]
  def getWorkflows()(implicit ec: ExecutionContext): Future[Seq[Workflow]]
  def getWorkflowsByProjectName(projectName: String)(implicit ec: ExecutionContext): Future[Seq[Workflow]]
  def deleteWorkflow(id: Long, user: String)(implicit ec: ExecutionContext): Future[Unit]
  def updateWorkflow(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): Future[Either[ApiError, Unit]]
  def switchWorkflowActiveState(id: Long, user: String)(implicit ec: ExecutionContext): Future[Unit]
  def getProjects()(implicit ec: ExecutionContext): Future[Seq[String]]
  def getProjectsInfo()(implicit ec: ExecutionContext): Future[Seq[ProjectInfo]]
}

@stereotype.Repository
class WorkflowRepositoryImpl(override val workflowHistoryRepository: WorkflowHistoryRepository) extends WorkflowRepository {

  import profile.api._

  private val logger = LoggerFactory.getLogger(this.getClass)

  override def insertWorkflow(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): Future[Either[ApiError, Long]] = {
    db.run(
      (for {
        workflowId <- workflowTable returning workflowTable.map(_.id) += workflow.toWorkflow.copy(created = LocalDateTime.now())
        sensorId <- sensorTable returning sensorTable.map(_.id) += workflow.sensor.copy(workflowId = workflowId)
        dagId <- dagDefinitionTable returning dagDefinitionTable.map(_.id) += workflow.dagDefinitionJoined.toDag().copy(workflowId = workflowId)
        jobId <- jobDefinitionTable returning jobDefinitionTable.map(_.id) ++= workflow.dagDefinitionJoined.jobDefinitions.map(_.copy(dagDefinitionId = dagId))
      } yield {
        workflowId
      }).flatMap(id => {
        getWorkflowJoined(id).map(
          workflowUpdated => workflowHistoryRepository.create(workflowUpdated, user)
        ).flatMap(_.map(_ => id))
      }).transactionally.asTry.map {
        case Success(workflowId) => Right(workflowId)
        case Failure(ex) =>
          logger.error(s"Unexpected error occurred when inserting workflow $workflow", ex)
          Left(GenericDatabaseError)
      }
    )
  }

  override def existsWorkflow(name: String)(implicit ec: ExecutionContext): Future[Boolean] = db.run(
    workflowTable.filter(_.name === name).exists.result
  )

  override def existsOtherWorkflow(name: String, id: Long)(implicit ec: ExecutionContext): Future[Boolean] = db.run(
    workflowTable.filter(_.name === name)
      .filter(_.id =!= id)
      .exists
      .result
  )

  private def getWorkflowJoined(id: Long)(implicit ec: ExecutionContext): DBIO[WorkflowJoined] = {
    (for {
      w <- workflowTable if w.id === id
      s <- sensorTable if s.workflowId === id
      dd <- dagDefinitionTable if dd.workflowId === id
      jd <- jobDefinitionTable if jd.dagDefinitionId === dd.id
    } yield {
      (w, s, dd, jd)
    }).result.map { wsddjd =>
      val workflowOption = wsddjd.headOption map {
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
      workflowOption.getOrElse(throw new Exception(s"Workflow with ${id} does not exist."));
    }
  }

  override def getWorkflow(id: Long)(implicit ec: ExecutionContext): Future[WorkflowJoined] = {
    db.run(getWorkflowJoined(id))
  }

  override def getWorkflows()(implicit ec: ExecutionContext): Future[Seq[Workflow]] = db.run(
    workflowTable.sortBy(_.name).result
  )

  override def getWorkflowsByProjectName(projectName: String)(implicit ec: ExecutionContext): Future[Seq[Workflow]] = db.run(
    workflowTable.filter(_.project === projectName).sortBy(_.name).result
  )

  override def deleteWorkflow(id: Long, user: String)(implicit ec: ExecutionContext): Future[Unit] = {
    val deleteSensor = sensorTable.filter(_.workflowId === id)
    val deleteEvent = eventTable.filter(_.sensorId in deleteSensor.map(_.id))
    val deleteDagIns = dagInstanceTable.filter(_.workflowId === id)
    val deleteDagDef = dagDefinitionTable.filter(_.workflowId === id)
    val deleteJobDef = jobDefinitionTable.filter(_.dagDefinitionId in deleteDagDef.map(_.id))
    val deleteJobIns = jobInstanceTable.filter(_.dagInstanceId in deleteDagIns.map(_.id))
    val deleteWorkflow = workflowTable.filter(_.id === id)

    db.run(getWorkflowJoined(id).flatMap(
      workflow => {
        workflowHistoryRepository.delete(workflow, user)
      }
    ).flatMap(_ =>
      deleteEvent.delete andThen
        deleteSensor.delete andThen
        deleteJobDef.delete andThen
        deleteJobIns.delete andThen
        deleteDagIns.delete andThen
        deleteDagDef.delete andThen
        deleteWorkflow.delete andThen
        DBIO.successful((): Unit
    )).transactionally)
  }

  override def updateWorkflow(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): Future[Either[ApiError, Unit]] = {
    db.run((for {
      w <- workflowTable.filter(_.id === workflow.id).update(workflow.toWorkflow.copy(updated = Option(LocalDateTime.now())))
      s <- sensorTable.filter(_.workflowId === workflow.id).update(workflow.sensor)
      dd <- dagDefinitionTable.filter(_.workflowId === workflow.id).update(workflow.dagDefinitionJoined.toDag())
      deleteJds <- jobDefinitionTable.filter(_.dagDefinitionId === workflow.dagDefinitionJoined.id).delete
      insertJds <- jobDefinitionTable ++= workflow.dagDefinitionJoined.jobDefinitions.map(_.copy(dagDefinitionId = workflow.dagDefinitionJoined.id))
    } yield {
      w
    }).asTry.map {
        case Success(_) => Right((): Unit)
        case Failure(ex) =>
          logger.error(s"Unexpected error occurred when updating workflow $workflow", ex)
          Left(GenericDatabaseError)
      }.flatMap(
      result => getWorkflowJoined(workflow.id).map(
        workflowUpdated => workflowHistoryRepository.update(workflowUpdated, user)
      ).flatMap(_.map(_ => result))
    ).transactionally)
  }

  override def switchWorkflowActiveState(id: Long, user: String)(implicit ec: ExecutionContext): Future[Unit] = {
    val workflowQuery = workflowTable.filter(_.id === id).map(workflow => (workflow.isActive, workflow.updated))
    val resultAction = for {
      workflowOpt <- workflowQuery.result.headOption
      workflowUpdatedActionOpt = workflowOpt.map(
        workflowValue =>
          workflowQuery.update((!workflowValue._1), Option(LocalDateTime.now()))
      )
      affected <- workflowUpdatedActionOpt.getOrElse(DBIO.successful(0))
    } yield {
      affected
    }

    db.run(
      resultAction.flatMap(result => {
        if (result == 1) {
          DBIO.successful((): Unit)
        } else {
          DBIO.failed(new Exception("Update workflow exception"))
        }
      }.flatMap(
        result => getWorkflowJoined(id).map(
          workflow => workflowHistoryRepository.update(workflow, user)
        ).flatMap(_.map(_ => result))
      )
      ).transactionally
    )
  }

  override def getProjects()(implicit ec: ExecutionContext): Future[Seq[String]] = db.run(
    workflowTable.map(_.project).distinct.sortBy(_.value).result
  )

  override def getProjectsInfo()(implicit ec: ExecutionContext): Future[Seq[ProjectInfo]] = db.run(
    workflowTable.map(_.project).groupBy(_.value).map(e => (e._1, e._2.length)).sortBy(_._1).result.map(_.map((ProjectInfo.apply _).tupled(_)))
  )

}
