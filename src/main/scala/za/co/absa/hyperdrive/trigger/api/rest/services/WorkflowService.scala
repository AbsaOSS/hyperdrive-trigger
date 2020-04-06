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

package za.co.absa.hyperdrive.trigger.api.rest.services

import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.models.errors.ApiError
import za.co.absa.hyperdrive.trigger.models.{Project, ProjectInfo, Workflow, WorkflowJoined}
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, WorkflowRepository}

import scala.concurrent.{ExecutionContext, Future}

trait WorkflowService {
  val workflowRepository: WorkflowRepository
  val dagInstanceRepository: DagInstanceRepository
  val workflowValidationService: WorkflowValidationService

  def createWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Either[Seq[ApiError], Boolean]]
  def getWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Option[WorkflowJoined]]
  def getWorkflows()(implicit ec: ExecutionContext): Future[Seq[Workflow]]
  def getWorkflowsByProjectName(projectName: String)(implicit ec: ExecutionContext): Future[Seq[Workflow]]
  def deleteWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Boolean]
  def updateWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Either[Seq[ApiError], Boolean]]
  def updateWorkflowActiveState(id: Long, isActive: Boolean)(implicit ec: ExecutionContext): Future[Boolean]
  def getProjectNames()(implicit ec: ExecutionContext): Future[Set[String]]
  def getProjects()(implicit ec: ExecutionContext): Future[Seq[Project]]
  def getProjectsInfo()(implicit ec: ExecutionContext): Future[Seq[ProjectInfo]]
  def runWorkflow(workflowId: Long)(implicit ec: ExecutionContext): Future[Boolean]
}

@Service
class WorkflowServiceImpl(override val workflowRepository: WorkflowRepository,
                          override val dagInstanceRepository: DagInstanceRepository,
                          override val workflowValidationService: WorkflowValidationService) extends WorkflowService {

  def createWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Either[Seq[ApiError], Boolean]] = {
    for {
      validationErrors <- workflowValidationService.validateOnInsert(workflow)
      dbError <- doIf(validationErrors.isEmpty, () => workflowRepository.insertWorkflow(workflow), None)
    } yield { toEither(Seq(validationErrors, dbError.map(error => Seq(error)))) }
  }

  private def doIf[T](condition: Boolean, future: () => Future[T], defaultValue: T) = {
    if (condition) future.apply() else Future.successful(defaultValue)
  }

  private def toEither(errorsOpts: Seq[Option[Seq[ApiError]]]): Either[Seq[ApiError], Boolean] = {
    val errors = errorsOpts
      .filter(_.isDefined)
      .flatMap(_.get)
    if (errors.isEmpty) {
      Right(true)
    } else {
      Left(errors)
    }
  }

  def getWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Option[WorkflowJoined]] = {
    workflowRepository.getWorkflow(id)
  }

  def getWorkflows()(implicit ec: ExecutionContext): Future[Seq[Workflow]] = {
    workflowRepository.getWorkflows()
  }

  def getWorkflowsByProjectName(projectName: String)(implicit ec: ExecutionContext): Future[Seq[Workflow]] = {
    workflowRepository.getWorkflowsByProjectName(projectName)
  }

  def deleteWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Boolean] = {
    workflowRepository.deleteWorkflow(id).map(_ => true)
  }

  override def updateWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Either[Seq[ApiError], Boolean]] = {
    for {
      validationErrors <- workflowValidationService.validateOnUpdate(workflow)
      dbError <- doIf(validationErrors.isEmpty, () => workflowRepository.updateWorkflow(workflow), None)
    } yield { toEither(Seq(validationErrors, dbError.map(error => Seq(error)))) }
  }

  override def updateWorkflowActiveState(id: Long, isActive: Boolean)(implicit ec: ExecutionContext): Future[Boolean] = {
    workflowRepository.updateWorkflowActiveState(id, isActive: Boolean).map(_ => true)
  }

  override def getProjectNames()(implicit ec: ExecutionContext): Future[Set[String]] = {
    workflowRepository.getProjects().map(_.toSet)
  }

  override def getProjects()(implicit ec: ExecutionContext): Future[Seq[Project]] = {
    workflowRepository.getWorkflows().map { workflows =>
      workflows.groupBy(_.project).map {
        case (projectName, workflows) => Project(projectName, workflows)
      }.toSeq
    }
  }

  override def getProjectsInfo()(implicit ec: ExecutionContext): Future[Seq[ProjectInfo]] = {
    workflowRepository.getProjectsInfo()
  }

  override def runWorkflow(workflowId: Long)(implicit ec: ExecutionContext): Future[Boolean] = {
    workflowRepository.getWorkflow(workflowId).map(_.map { joinedWorkflow =>
      dagInstanceRepository.insertJoinedDagInstance(joinedWorkflow.dagDefinitionJoined.toDagInstanceJoined())
    }).map(_ => true)
  }

}
