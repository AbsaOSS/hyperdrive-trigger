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

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.models.errors.{ApiError, ImportError}
import za.co.absa.hyperdrive.trigger.models.{Project, ProjectInfo, Workflow, WorkflowImportExportWrapper, WorkflowJoined}
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, WorkflowRepository}

import scala.concurrent.{ExecutionContext, Future}

trait WorkflowService {
  val workflowRepository: WorkflowRepository
  val dagInstanceRepository: DagInstanceRepository
  val jobTemplateService: JobTemplateService
  val workflowValidationService: WorkflowValidationService

  def createWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Either[Seq[ApiError], WorkflowJoined]]
  def getWorkflow(id: Long)(implicit ec: ExecutionContext): Future[WorkflowJoined]
  def getWorkflows()(implicit ec: ExecutionContext): Future[Seq[Workflow]]
  def getWorkflowsByProjectName(projectName: String)(implicit ec: ExecutionContext): Future[Seq[Workflow]]
  def deleteWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Boolean]
  def updateWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Either[Seq[ApiError], WorkflowJoined]]
  def switchWorkflowActiveState(id: Long)(implicit ec: ExecutionContext): Future[Boolean]
  def activateWorkflows(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Boolean]
  def deactivateWorkflows(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Boolean]
  def getProjectNames()(implicit ec: ExecutionContext): Future[Set[String]]
  def getProjects()(implicit ec: ExecutionContext): Future[Seq[Project]]
  def getProjectsInfo()(implicit ec: ExecutionContext): Future[Seq[ProjectInfo]]
  def runWorkflow(workflowId: Long)(implicit ec: ExecutionContext): Future[Boolean]
  def runWorkflowJobs(workflowId: Long, jobIds: Seq[Long])(implicit ec: ExecutionContext): Future[Boolean]
  def exportWorkflow(workflowId: Long)(implicit ec: ExecutionContext): Future[WorkflowImportExportWrapper]
  def importWorkflow(workflowImport: WorkflowImportExportWrapper)(implicit ec: ExecutionContext): Future[Either[Seq[ApiError], WorkflowJoined]]
}

@Service
class WorkflowServiceImpl(override val workflowRepository: WorkflowRepository,
                          override val dagInstanceRepository: DagInstanceRepository,
                          override val jobTemplateService: JobTemplateService,
                          override val workflowValidationService: WorkflowValidationService) extends WorkflowService {

  def createWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Either[Seq[ApiError], WorkflowJoined]] = {
    val userName = getUserName.apply();
    for {
      validationErrors <- workflowValidationService.validateOnInsert(workflow)
      result <- doIf(validationErrors, () => {
        workflowRepository.insertWorkflow(workflow, userName).flatMap {
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
    val userName = getUserName.apply();
    workflowRepository.deleteWorkflow(id, userName).map(_ => true)
  }

  override def updateWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Either[Seq[ApiError], WorkflowJoined]] = {
    val userName = getUserName.apply();

    for {
      originalWorkflow <- getWorkflow(workflow.id)
      validationErrors <- workflowValidationService.validateOnUpdate(originalWorkflow, workflow)
      result <- doIf(validationErrors, () => {
        val updatedWorkflow = workflow.copy(
          id = originalWorkflow.id,
          created = originalWorkflow.created,
          updated = originalWorkflow.updated,
          sensor = workflow.sensor.copy(
            id = originalWorkflow.sensor.id,
            workflowId = originalWorkflow.id,
            properties = workflow.sensor.properties.copy(
              sensorId = originalWorkflow.sensor.properties.sensorId
            )
          ),
          dagDefinitionJoined = workflow.dagDefinitionJoined.copy(
            id = originalWorkflow.dagDefinitionJoined.id,
            workflowId = originalWorkflow.id
          )
        )

        workflowRepository.updateWorkflow(updatedWorkflow, userName).flatMap {
          case Left(error) => Future.successful(Left(error))
          case Right(_) => getWorkflow(workflow.id).map(Right(_))
        }
      })
    } yield {
      result
    }
  }

  override def switchWorkflowActiveState(id: Long)(implicit ec: ExecutionContext): Future[Boolean] = {
    val userName = getUserName.apply();
    workflowRepository.switchWorkflowActiveState(id, userName).map(_ => true)
  }

  override def activateWorkflows(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Boolean] = ???

  override def deactivateWorkflows(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Boolean] = ???


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
    val userName = getUserName.apply()

    for {
      joinedWorkflow <- workflowRepository.getWorkflow(workflowId)
      dagInstanceJoined <- jobTemplateService.resolveJobTemplate(joinedWorkflow.dagDefinitionJoined, userName)
      _ <- dagInstanceRepository.insertJoinedDagInstance(dagInstanceJoined)
    } yield {
      true
    }
  }

  override def runWorkflowJobs(workflowId: Long, jobIds: Seq[Long])(implicit ec: ExecutionContext): Future[Boolean] = {
    val userName = getUserName.apply();

    workflowRepository.getWorkflow(workflowId).flatMap(joinedWorkflow => {
      val dagDefinitionJoined = joinedWorkflow.dagDefinitionJoined

      val anyJobIdIsNotPartOfWorkflow = !jobIds.forall(id => dagDefinitionJoined.jobDefinitions.map(_.id).contains(id))

      if(anyJobIdIsNotPartOfWorkflow) {
        Future.successful(false)
      } else {
        val dagDefinitionWithFilteredJobs = dagDefinitionJoined.copy(
          jobDefinitions = dagDefinitionJoined.jobDefinitions.filter(job => jobIds.contains(job.id))
        )
        for {
          dagInstanceJoined <- jobTemplateService.resolveJobTemplate(dagDefinitionWithFilteredJobs, userName)
          _ <- dagInstanceRepository.insertJoinedDagInstance(dagInstanceJoined)
        } yield {
          true
        }
      }
    })
  }

  override def exportWorkflow(workflowId: Long)(implicit ec: ExecutionContext): Future[WorkflowImportExportWrapper] = {
    for {
      workflow <- getWorkflow(workflowId)
      jobTemplateIds = workflow.dagDefinitionJoined.jobDefinitions.map(_.jobTemplateId).distinct
      jobTemplates <- jobTemplateService.getJobTemplatesByIds(jobTemplateIds)
    } yield WorkflowImportExportWrapper(workflow, jobTemplates)
  }

  override def importWorkflow(workflowImport: WorkflowImportExportWrapper)(implicit ec: ExecutionContext): Future[Either[Seq[ApiError], WorkflowJoined]] = {
    val jobTemplatesNames = workflowImport.jobTemplates.map(_.name)
    val oldIdNameMap = workflowImport.jobTemplates.map(jobTemplate => jobTemplate.id -> jobTemplate.name).toMap
    jobTemplateService.getJobTemplateIdsByNames(jobTemplatesNames).flatMap(
      newNameIdMap => {
        val missingTemplates = jobTemplatesNames.toSet.diff(newNameIdMap.keySet)
        if (missingTemplates.nonEmpty) {
          Future{Left(Seq(ImportError(s"The following Job Templates don't exist yet and have to be created before importing" +
            s" this workflow: ${missingTemplates.reduce(_ + ", " + _)}")))}
        } else {
          def getNewId(oldTemplateId: Long) = {
            val name = oldIdNameMap.get(oldTemplateId) match {
              case Some(x) => x
              case None => throw new IllegalArgumentException(s"Template Id $oldTemplateId is not referenced in $oldIdNameMap")
            }
            newNameIdMap.get(name) match {
              case Some(x) => x
              case None =>
                // should never happen
                throw new IllegalArgumentException(s"Template name $name is not reference in $newNameIdMap")
            }
          }
          val workflowWithResolvedJobTemplateIds = workflowImport.workflowJoined
            .copy(dagDefinitionJoined = workflowImport.workflowJoined.dagDefinitionJoined
              .copy(jobDefinitions = workflowImport.workflowJoined.dagDefinitionJoined.jobDefinitions
                .map(jobDefinition => jobDefinition.copy(jobTemplateId = getNewId(jobDefinition.jobTemplateId)))))

          Future{Right(workflowWithResolvedJobTemplateIds)}
        }
      }
    )
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

  private[services] def getUserName: () => String = {
    SecurityContextHolder.getContext.getAuthentication.getPrincipal.asInstanceOf[UserDetails].getUsername
  }
}
