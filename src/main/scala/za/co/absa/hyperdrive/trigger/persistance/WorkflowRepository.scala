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
import za.co.absa.hyperdrive.trigger.models.enums.SchedulerInstanceStatuses
import za.co.absa.hyperdrive.trigger.models.enums.SchedulerInstanceStatuses.SchedulerInstanceStatus
import za.co.absa.hyperdrive.trigger.models.errors.{ApiException, GenericDatabaseError}
import za.co.absa.hyperdrive.trigger.models.{ProjectInfo, _}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

trait WorkflowRepository extends Repository {
  val workflowHistoryRepository: WorkflowHistoryRepository

  def insertWorkflow(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): Future[Long]
  def insertWorkflows(workflow: Seq[WorkflowJoined], user: String)(implicit ec: ExecutionContext): Future[Seq[Long]]
  def existsWorkflows(names: Seq[String])(implicit ec: ExecutionContext): Future[Seq[String]]
  def existsOtherWorkflow(name: String, id: Long)(implicit ec: ExecutionContext): Future[Boolean]
  def existsWorkflowWithPrefix(workflowPrefix: String)(implicit ec: ExecutionContext): Future[Boolean]
  def getWorkflow(id: Long)(implicit ec: ExecutionContext): Future[WorkflowJoined]
  def getWorkflows(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[WorkflowJoined]]
  def getWorkflows()(implicit ec: ExecutionContext): Future[Seq[Workflow]]
  def getWorkflowsByProjectName(projectName: String)(implicit ec: ExecutionContext): Future[Seq[Workflow]]
  def deleteWorkflow(id: Long, user: String)(implicit ec: ExecutionContext): Future[Unit]
  def updateWorkflow(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): Future[Unit]
  def switchWorkflowActiveState(id: Long, user: String)(implicit ec: ExecutionContext): Future[Unit]
  def updateWorkflowsIsActive(ids: Seq[Long], isActiveNewValue: Boolean, user: String)(implicit ec: ExecutionContext): Future[Unit]
  def getProjects()(implicit ec: ExecutionContext): Future[Seq[String]]
  def getProjectsInfo()(implicit ec: ExecutionContext): Future[Seq[ProjectInfo]]
  def existsProject(project: String)(implicit ec: ExecutionContext): Future[Boolean]
  def releaseWorkflowAssignmentsOfDeactivatedInstances()(implicit ec: ExecutionContext): Future[(Int, Int)]
  def releaseWorkflowAssignments(workflowIds: Seq[Long], instanceId: Long)(implicit ec: ExecutionContext): Future[Int]
  def acquireWorkflowAssignments(workflowIds: Seq[Long], instanceId: Long)(implicit ec: ExecutionContext): Future[Int]
  def getWorkflowsBySchedulerInstance(instanceId: Long)(implicit ec: ExecutionContext): Future[Seq[Workflow]]
  def getMaxWorkflowId(implicit ec: ExecutionContext): Future[Option[Long]]
}

@stereotype.Repository
class WorkflowRepositoryImpl(override val workflowHistoryRepository: WorkflowHistoryRepository) extends WorkflowRepository {

  import api._

  private val repositoryLogger = LoggerFactory.getLogger(this.getClass)

  override def insertWorkflow(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): Future[Long] = {
    db.run(
      insertWorkflowInternal(workflow, user)
        .transactionally.asTry.map {
          case Success(workflowId) => workflowId
          case Failure(ex) =>
            repositoryLogger.error(s"Unexpected error occurred when inserting workflow $workflow", ex)
            throw new ApiException(GenericDatabaseError)
        }
    )
  }

  private def insertWorkflowInternal(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext) = {
    (for {
      workflowId <- workflowTable returning workflowTable.map(_.id) += workflow.toWorkflow.copy(created = LocalDateTime.now())
      _ <- sensorTable returning sensorTable.map(_.id) += workflow.sensor.copy(workflowId = workflowId)
      dagId <- dagDefinitionTable returning dagDefinitionTable.map(_.id) += workflow.dagDefinitionJoined.toDag().copy(workflowId = workflowId)
      _ <- jobDefinitionTable returning jobDefinitionTable.map(_.id) ++= workflow.dagDefinitionJoined.jobDefinitions.map(_.copy(dagDefinitionId = dagId))
    } yield {
      workflowId
    }).flatMap(id => {
      getSingleWorkflowJoined(id).map(
        workflowUpdated => workflowHistoryRepository.create(workflowUpdated, user)
      ).flatMap(_.map(_ => id))
    })
  }

  override def insertWorkflows(workflows: Seq[WorkflowJoined], user: String)(implicit ec: ExecutionContext): Future[Seq[Long]] = {
    db.run(
      workflows
        .map(workflow => insertWorkflowInternal(workflow, user).map(id => Seq(id)))
        .reduceLeftOption(_.zipWith(_)(_ ++ _))
        .getOrElse(DBIO.successful(Seq()))
        .transactionally.asTry.map {
          case Success(ids) => ids
          case Failure(ex) =>
            repositoryLogger.error(s"Unexpected error occurred when inserting workflows $workflows", ex)
            throw new ApiException(GenericDatabaseError)
        }
    )
  }

  override def existsWorkflows(names: Seq[String])(implicit ec: ExecutionContext): Future[Seq[String]] = db.run(
    workflowTable.filter(_.name inSetBind names).map(_.name).result
  )

  override def existsOtherWorkflow(name: String, id: Long)(implicit ec: ExecutionContext): Future[Boolean] = db.run(
    workflowTable.filter(_.name === name)
      .filter(_.id =!= id)
      .exists
      .result
  )

  override def existsWorkflowWithPrefix(workflowPrefix: String)(implicit ec: ExecutionContext): Future[Boolean] = db.run(
    workflowTable.filter(w => w.name.toLowerCase.like(LiteralColumn[String](s"${workflowPrefix.toLowerCase}%")))
      .exists
      .result
  )

  private def getWorkflowJoineds(ids: Seq[Long])(implicit ec: ExecutionContext): DBIO[Seq[WorkflowJoined]] = {
    (for {
      w <- workflowTable if w.id inSetBind ids
      s <- sensorTable if s.workflowId === w.id
      dd <- dagDefinitionTable if dd.workflowId === w.id
      jd <- jobDefinitionTable if jd.dagDefinitionId === dd.id
    } yield {
      (w, s, dd, jd)
    }).result.map {
      allWsddjd =>
        allWsddjd.groupBy(_._1.id).map(wsddjdGroup => {
          val wsddjd = wsddjdGroup._2
          val w = wsddjd.head._1
          val s = wsddjd.head._2
          val dd = wsddjd.head._3
          WorkflowJoined(
            name = w.name,
            isActive = w.isActive,
            project = w.project,
            created = w.created,
            updated = w.updated,
            schedulerInstanceId = w.schedulerInstanceId,
            sensor = s,
            dagDefinitionJoined = DagDefinitionJoined(
              workflowId = dd.workflowId,
              jobDefinitions = wsddjd.map(_._4),
              id = dd.id
            ),
            id = w.id
          )
        }).toSeq
    }
  }

  private def getSingleWorkflowJoined(id: Long)(implicit ec: ExecutionContext): DBIO[WorkflowJoined] = {
    getWorkflowJoineds(Seq(id)).map(workflowJoineds => {
      workflowJoineds.headOption.getOrElse(throw new Exception(s"Workflow with id ${id} does not exist."))
    })
  }

  override def getWorkflow(id: Long)(implicit ec: ExecutionContext): Future[WorkflowJoined] = {
    db.run(getSingleWorkflowJoined(id))
  }

  override def getWorkflows(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[WorkflowJoined]] = {
    db.run(getWorkflowJoineds(ids))
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

    db.run(getSingleWorkflowJoined(id).flatMap(
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

  override def updateWorkflow(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): Future[Unit] = {
    val w = workflow.toWorkflow.copy(updated = Option(LocalDateTime.now()))
    db.run(
      (for {
        w <- workflowTable.filter(_.id === workflow.id)
          .map(t => (t.name, t.isActive, t.project, t.updated))
          .update((w.name, w.isActive, w.project, w.updated))
        s <- sensorTable.filter(_.workflowId === workflow.id).update(workflow.sensor)
        dd <- dagDefinitionTable.filter(_.workflowId === workflow.id).update(workflow.dagDefinitionJoined.toDag())
        deleteJds <- jobDefinitionTable.filter(_.dagDefinitionId === workflow.dagDefinitionJoined.id).delete
        insertJds <- jobDefinitionTable ++= workflow.dagDefinitionJoined.jobDefinitions.map(_.copy(dagDefinitionId = workflow.dagDefinitionJoined.id))
      } yield {
        w
      }).flatMap(
        result => getSingleWorkflowJoined(workflow.id).map(
          workflowUpdated => workflowHistoryRepository.update(workflowUpdated, user)
        ).flatMap(_.map(_ => result))
      ).transactionally.asTry.map {
        case Success(_) => (): Unit
        case Failure(ex) =>
          repositoryLogger.error(s"Unexpected error occurred when updating workflow $workflow", ex)
          throw new ApiException(GenericDatabaseError)
      }
    )
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
      resultAction.flatMap(
        result => getSingleWorkflowJoined(id).map(
          workflow => workflowHistoryRepository.update(workflow, user)
        ).flatMap(_.map(_ => result))
      ).flatMap(result => {
        if (result == 1) {
          DBIO.successful((): Unit)
        } else {
          DBIO.failed(new Exception("Update workflow exception"))
        }
      }).transactionally
    )
  }

  override def updateWorkflowsIsActive(ids: Seq[Long], isActiveNewValue: Boolean, user: String)(implicit ec: ExecutionContext): Future[Unit] = {
    val updateIdsAction = workflowTable.filter(_.id inSetBind ids)
      .map(workflow => (workflow.isActive, workflow.updated))
      .update((isActiveNewValue, Option(LocalDateTime.now())))

    val insertHistoryEntryActions = ids
      .map(id => getSingleWorkflowJoined(id).flatMap(workflow => workflowHistoryRepository.update(workflow, user)))
      .reduceLeftOption(_.andThen(_))
      .getOrElse(DBIO.successful())

    db.run(
      updateIdsAction
        .andThen(insertHistoryEntryActions)
        .andThen(DBIO.successful())
        .transactionally
    )
  }

  override def getProjects()(implicit ec: ExecutionContext): Future[Seq[String]] = db.run(
    workflowTable.map(_.project).distinct.sortBy(_.value).result
  )

  override def getProjectsInfo()(implicit ec: ExecutionContext): Future[Seq[ProjectInfo]] = db.run(
    workflowTable.map(_.project).groupBy(_.value).map(e => (e._1, e._2.length)).sortBy(_._1).result.map(_.map((ProjectInfo.apply _).tupled(_)))
  )

  override def existsProject(project: String)(implicit ec: ExecutionContext): Future[Boolean] = db.run(
    workflowTable.filter(_.project.toLowerCase === project.toLowerCase).exists.result
  )

  override def releaseWorkflowAssignmentsOfDeactivatedInstances()(implicit ec: ExecutionContext): Future[(Int, Int)] = db.run(
    (
      for {
        workflowUpdatedCount <- workflowTable
          .filter(w => schedulerInstanceTable
            .filter(_.id === w.schedulerInstanceId)
            .filter(_.status === LiteralColumn[SchedulerInstanceStatus](SchedulerInstanceStatuses.Deactivated)).exists)
          .map(_.schedulerInstanceId)
          .update(None)
        instancesDeletedCount <- schedulerInstanceTable
          .filter(_.status === LiteralColumn[SchedulerInstanceStatus](SchedulerInstanceStatuses.Deactivated))
          .delete
      } yield (workflowUpdatedCount, instancesDeletedCount)
    ).transactionally
    )

  override def releaseWorkflowAssignments(workflowIds: Seq[Long], instanceId: Long)(implicit ec: ExecutionContext): Future[Int] = db.run(
    workflowTable.filter(_.schedulerInstanceId === instanceId)
      .filter(_.id inSetBind workflowIds)
      .map(_.schedulerInstanceId)
      .update(None)
  )

  override def acquireWorkflowAssignments(workflowIds: Seq[Long], instanceId: Long)(implicit ec: ExecutionContext): Future[Int] = db.run(
    workflowTable.filter(_.schedulerInstanceId.isEmpty)
      .filter(_.id inSetBind workflowIds)
      .map(_.schedulerInstanceId)
      .update(Some(instanceId))
  )

  override def getWorkflowsBySchedulerInstance(instanceId: Long)(implicit ec: ExecutionContext): Future[Seq[Workflow]] = db.run(
    workflowTable.filter(_.schedulerInstanceId === instanceId).result
  )

  override def getMaxWorkflowId(implicit ec: ExecutionContext): Future[Option[Long]] = db.run(
    workflowTable.map(_.id).max.result
  )
}
