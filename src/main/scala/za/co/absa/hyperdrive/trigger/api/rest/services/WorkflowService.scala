/*
 * Copyright 2018-2019 ABSA Group Limited
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

import za.co.absa.hyperdrive.trigger.models.{ProjectInfo, Workflow, WorkflowJoined}
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, WorkflowRepository}

import scala.concurrent.{ExecutionContext, Future}

trait WorkflowService {
  val workflowRepository: WorkflowRepository
  val dagInstanceRepository: DagInstanceRepository

  def createWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Boolean]
  def getWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Option[WorkflowJoined]]
  def getWorkflows()(implicit ec: ExecutionContext): Future[Seq[Workflow]]
  def getWorkflowsByProjectName(projectName: String)(implicit ec: ExecutionContext): Future[Seq[Workflow]]
  def deleteWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Boolean]
  def updateWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Boolean]
  def updateWorkflowActiveState(id: Long, isActive: Boolean)(implicit ec: ExecutionContext): Future[Boolean]
  def getProjects()(implicit ec: ExecutionContext): Future[Set[String]]
  def getProjectsInfo()(implicit ec: ExecutionContext): Future[Seq[ProjectInfo]]
  def runWorkflow(workflowId: Long)(implicit ec: ExecutionContext): Future[Boolean]
}

class WorkflowServiceImpl(override val workflowRepository: WorkflowRepository, override val dagInstanceRepository: DagInstanceRepository) extends WorkflowService {

  def createWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Boolean] = {
    workflowRepository.insertWorkflow(workflow).map(_ => true)
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

  override def updateWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Boolean] = {
    workflowRepository.updateWorkflow(workflow).map(_ => true)
  }

  override def updateWorkflowActiveState(id: Long, isActive: Boolean)(implicit ec: ExecutionContext): Future[Boolean] = {
    workflowRepository.updateWorkflowActiveState(id, isActive: Boolean).map(_ => true)
  }

  override def getProjects()(implicit ec: ExecutionContext): Future[Set[String]] = {
    workflowRepository.getProjects().map(_.toSet)
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
