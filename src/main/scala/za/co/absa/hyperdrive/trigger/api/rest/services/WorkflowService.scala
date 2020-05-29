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

import java.time.LocalDateTime
import java.util.UUID

import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes
import za.co.absa.hyperdrive.trigger.models.errors.ApiError
import za.co.absa.hyperdrive.trigger.models.{Project, ProjectInfo, Workflow, WorkflowJoined}
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, WorkflowRepository}
import za.co.absa.hyperdrive.trigger.scheduler.sensors.time.TimeSensorSettings

import scala.concurrent.{ExecutionContext, Future}

trait WorkflowService {
  val workflowRepository: WorkflowRepository
  val dagInstanceRepository: DagInstanceRepository
  val workflowValidationService: WorkflowValidationService

  def createWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Either[Seq[ApiError], WorkflowJoined]]
  def getWorkflow(id: Long)(implicit ec: ExecutionContext): Future[WorkflowJoined]
  def getWorkflows()(implicit ec: ExecutionContext): Future[Seq[Workflow]]
  def getWorkflowsByProjectName(projectName: String)(implicit ec: ExecutionContext): Future[Seq[Workflow]]
  def deleteWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Boolean]
  def updateWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Either[Seq[ApiError], WorkflowJoined]]
  def switchWorkflowActiveState(id: Long)(implicit ec: ExecutionContext): Future[Boolean]
  def getProjectNames()(implicit ec: ExecutionContext): Future[Set[String]]
  def getProjects()(implicit ec: ExecutionContext): Future[Seq[Project]]
  def getProjectsInfo()(implicit ec: ExecutionContext): Future[Seq[ProjectInfo]]
  def runWorkflow(workflowId: Long)(implicit ec: ExecutionContext): Future[Boolean]
}

@Service
class WorkflowServiceImpl(override val workflowRepository: WorkflowRepository,
                          override val dagInstanceRepository: DagInstanceRepository,
                          override val workflowValidationService: WorkflowValidationService) extends WorkflowService {

  def createWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Either[Seq[ApiError], WorkflowJoined]] = {
    val workflowWithQuartzJobId = addQuartzJobIdForTimeSensor(workflow)
    for {
      validationErrors <- workflowValidationService.validateOnInsert(workflowWithQuartzJobId)
      result <- doIf(validationErrors, () => {
        workflowRepository.insertWorkflow(workflowWithQuartzJobId).flatMap {
          case Left(error) => Future.successful(Left(error))
          case Right(workflowId) => getWorkflow(workflowId).map(Right(_))
        }
      })
    } yield {
      result
    }
  }

  def getWorkflow(id: Long)(implicit ec: ExecutionContext): Future[WorkflowJoined] = {
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

  override def updateWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Either[Seq[ApiError], WorkflowJoined]] = {
    val workflowWithQuartzJobId = addQuartzJobIdForTimeSensor(workflow)
    for {
      validationErrors <- workflowValidationService.validateOnUpdate(workflowWithQuartzJobId)
      result <- doIf(validationErrors, () => {
        getWorkflow(workflowWithQuartzJobId.id).flatMap { originalWorkflow =>
          val updatedWorkflow = workflowWithQuartzJobId.copy(
            id = originalWorkflow.id,
            created = originalWorkflow.created,
            updated = originalWorkflow.updated,
            sensor = workflowWithQuartzJobId.sensor.copy(
              id = originalWorkflow.sensor.id,
              workflowId = originalWorkflow.id,
              properties = workflowWithQuartzJobId.sensor.properties.copy(
                sensorId = originalWorkflow.sensor.properties.sensorId
              )
            ),
            dagDefinitionJoined = workflowWithQuartzJobId.dagDefinitionJoined.copy(
              id = originalWorkflow.dagDefinitionJoined.id,
              workflowId = originalWorkflow.id
            )
          )

          workflowRepository.updateWorkflow(updatedWorkflow).flatMap {
            case Left(error) => Future.successful(Left(error))
            case Right(_) => getWorkflow(workflowWithQuartzJobId.id).map(Right(_))
          }
        }
      })
    } yield {
      result
    }
  }

  override def switchWorkflowActiveState(id: Long)(implicit ec: ExecutionContext): Future[Boolean] = {
    workflowRepository.switchWorkflowActiveState(id).map(_ => true)
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
    workflowRepository.getWorkflow(workflowId).map( joinedWorkflow =>
      dagInstanceRepository.insertJoinedDagInstance(joinedWorkflow.dagDefinitionJoined.toDagInstanceJoined())
    ).map(_ => true)
  }

  private def doIf[T](validationErrors: Seq[ApiError], future: () => Future[Either[ApiError, T]])(implicit ec: ExecutionContext): Future[Either[Seq[ApiError], T]] = {
    if (validationErrors.isEmpty) {
      future.apply().map {
        case Left(error) => Left(Seq(error))
        case Right(result) => Right(result)
      }
    } else {
      Future.successful(Left(validationErrors))
    }
  }

  private def addQuartzJobIdForTimeSensor(workflow: WorkflowJoined): WorkflowJoined = {
    if (workflow.sensor.sensorType == SensorTypes.Time &&
      !workflow.sensor.properties.settings.variables.contains(TimeSensorSettings.QUARTZ_JOB_ID_KEY)) {
      val variablesWithQuartzJobId = workflow.sensor.properties.settings.variables + (TimeSensorSettings.QUARTZ_JOB_ID_KEY -> UUID.randomUUID().toString)
      workflow.copy(
        sensor = workflow.sensor.copy(
          properties = workflow.sensor.properties.copy(
            settings = workflow.sensor.properties.settings.copy(variables = variablesWithQuartzJobId))))
    } else {
      workflow
    }
  }

}
