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
import za.co.absa.hyperdrive.trigger.models.{Project, ProjectInfo, Workflow, WorkflowImportExportWrapper, WorkflowJoined}
import za.co.absa.hyperdrive.trigger.models.errors.{ApiException, BulkOperationError, GenericError}
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, WorkflowRepository}
import org.slf4j.LoggerFactory
import za.co.absa.hyperdrive.trigger.scheduler.utilities.ApplicationConfig

import scala.concurrent.{ExecutionContext, Future}

trait WorkflowService {
  val workflowRepository: WorkflowRepository
  val dagInstanceRepository: DagInstanceRepository
  val dagInstanceService: DagInstanceService
  val jobTemplateService: JobTemplateService
  val workflowValidationService: WorkflowValidationService

  def createWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[WorkflowJoined]

  def getWorkflow(id: Long)(implicit ec: ExecutionContext): Future[WorkflowJoined]

  def getWorkflows()(implicit ec: ExecutionContext): Future[Seq[Workflow]]

  def getWorkflowsByProjectName(projectName: String)(implicit ec: ExecutionContext): Future[Seq[Workflow]]

  def deleteWorkflow(id: Long)(implicit ec: ExecutionContext): Future[Boolean]

  def updateWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[WorkflowJoined]

  def switchWorkflowActiveState(id: Long)(implicit ec: ExecutionContext): Future[Boolean]

  def updateWorkflowsIsActive(ids: Seq[Long], isActiveNewValue: Boolean)(implicit ec: ExecutionContext): Future[Boolean]

  def getProjectNames()(implicit ec: ExecutionContext): Future[Set[String]]

  def getProjects()(implicit ec: ExecutionContext): Future[Seq[Project]]

  def getProjectsInfo()(implicit ec: ExecutionContext): Future[Seq[ProjectInfo]]

  def runWorkflows(workflowIds: Seq[Long])(implicit ec: ExecutionContext): Future[Boolean]

  def runWorkflowJobs(workflowId: Long, jobIds: Seq[Long])(implicit ec: ExecutionContext): Future[Boolean]

  def exportWorkflows(workflowIds: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[WorkflowImportExportWrapper]]

  def importWorkflows(workflowImports: Seq[WorkflowImportExportWrapper])(implicit ec: ExecutionContext): Future[Seq[Project]]

  def convertToWorkflowJoined(workflowImport: WorkflowImportExportWrapper)(implicit ec: ExecutionContext): Future[WorkflowJoined]
}

@Service
class WorkflowServiceImpl(override val workflowRepository: WorkflowRepository,
                          override val dagInstanceRepository: DagInstanceRepository,
                          override val dagInstanceService: DagInstanceService,
                          override val jobTemplateService: JobTemplateService,
                          override val workflowValidationService: WorkflowValidationService) extends WorkflowService {

  private val serviceLogger = LoggerFactory.getLogger(this.getClass)

  def createWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[WorkflowJoined] = {
    val userName = getUserName.apply()
    for {
      _ <- workflowValidationService.validateOnInsert(workflow)
      workflowId <- workflowRepository.insertWorkflow(workflow, userName)
      workflowJoined <- getWorkflow(workflowId)
    } yield {
      workflowJoined
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
    val userName = getUserName.apply()
    workflowRepository.deleteWorkflow(id, userName).map(_ => true)
  }

  override def updateWorkflow(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[WorkflowJoined] = {
    val userName = getUserName.apply()

    for {
      originalWorkflow <- getWorkflow(workflow.id)
      _ <- workflowValidationService.validateOnUpdate(originalWorkflow, workflow)
      mergedWorkflow = mergeWithOriginalWorkflow(originalWorkflow, workflow)
      _ <- workflowRepository.updateWorkflow(mergedWorkflow, userName)
      updatedWorkflow <- getWorkflow(workflow.id)
    } yield {
      updatedWorkflow
    }
  }

  private def mergeWithOriginalWorkflow(originalWorkflow: WorkflowJoined, workflow: WorkflowJoined) = {
    workflow.copy(
      id = originalWorkflow.id,
      created = originalWorkflow.created,
      updated = originalWorkflow.updated,
      sensor = workflow.sensor.copy(
        id = originalWorkflow.sensor.id,
        workflowId = originalWorkflow.id,
        properties = workflow.sensor.properties
      ),
      dagDefinitionJoined = workflow.dagDefinitionJoined.copy(
        id = originalWorkflow.dagDefinitionJoined.id,
        workflowId = originalWorkflow.id
      )
    )
  }

  override def switchWorkflowActiveState(id: Long)(implicit ec: ExecutionContext): Future[Boolean] = {
    val userName = getUserName.apply()
    workflowRepository.switchWorkflowActiveState(id, userName).map(_ => true)
  }

  override def updateWorkflowsIsActive(ids: Seq[Long], isActiveNewValue: Boolean)(implicit ec: ExecutionContext): Future[Boolean] = {
    val userName = getUserName.apply()
    workflowRepository.updateWorkflowsIsActive(ids, isActiveNewValue, userName).map(_ => true)
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

  override def runWorkflows(workflowIds: Seq[Long])(implicit ec: ExecutionContext): Future[Boolean] = {
    val userName = getUserName.apply()
    workflowIds.distinct.length match {
      case numberOfWorkflows if numberOfWorkflows == 1 =>
        throw new ApiException(GenericError(s"More than 1 workflow has to be triggered!"))
      case numberOfWorkflows if numberOfWorkflows > ApplicationConfig.maximumNumberOfWorkflowsInBulkRun =>
        throw new ApiException(GenericError(
          s"Cannot trigger more than ${ApplicationConfig.maximumNumberOfWorkflowsInBulkRun} workflows!"
        ))
      case _ =>
        serviceLogger.debug(s"User: $userName called bulk run workflows. Workflows: $workflowIds will be executed.")
        for {
          joinedWorkflows <- workflowRepository.getWorkflows(workflowIds.distinct)
          dagInstanceJoined <- Future.sequence(
            joinedWorkflows.map(joinedWorkflow =>
              dagInstanceService.createDagInstance(joinedWorkflow.dagDefinitionJoined, userName)
            )
          )
          _ <- dagInstanceRepository.insertJoinedDagInstances(dagInstanceJoined)
        } yield {
          true
        }
    }
  }

  override def runWorkflowJobs(workflowId: Long, jobIds: Seq[Long])(implicit ec: ExecutionContext): Future[Boolean] = {
    val userName = getUserName.apply()

    workflowRepository.getWorkflow(workflowId).flatMap(joinedWorkflow => {
      val dagDefinitionJoined = joinedWorkflow.dagDefinitionJoined

      val anyJobIdIsNotPartOfWorkflow = !jobIds.forall(id => dagDefinitionJoined.jobDefinitions.map(_.id).contains(id))

      if (anyJobIdIsNotPartOfWorkflow) {
        Future.successful(false)
      } else {
        val dagDefinitionWithFilteredJobs = dagDefinitionJoined.copy(
          jobDefinitions = dagDefinitionJoined.jobDefinitions.filter(job => jobIds.contains(job.id))
        )
        for {
          dagInstanceJoined <- dagInstanceService.createDagInstance(dagDefinitionWithFilteredJobs, userName)
          _ <- dagInstanceRepository.insertJoinedDagInstance(dagInstanceJoined)
        } yield {
          true
        }
      }
    })
  }

  override def exportWorkflows(workflowIds: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[WorkflowImportExportWrapper]] = {
    for {
      workflows <- workflowRepository.getWorkflows(workflowIds)
      allJobTemplateIds = workflows.flatMap(_.dagDefinitionJoined.jobDefinitions.map(_.jobTemplateId)).distinct
      allJobTemplates <- jobTemplateService.getJobTemplatesByIds(allJobTemplateIds)
    } yield {
      workflows.map(workflow => {
        val jobTemplateIds = workflow.dagDefinitionJoined.jobDefinitions.map(_.jobTemplateId).distinct
        val jobTemplates = allJobTemplates.filter(jobTemplate => jobTemplateIds.contains(jobTemplate.id))
        WorkflowImportExportWrapper(workflow, jobTemplates)
      })
    }
  }

  override def importWorkflows(workflowImports: Seq[WorkflowImportExportWrapper])(implicit ec: ExecutionContext): Future[Seq[Project]] = {
    val userName = getUserName.apply()
    for {
      workflowJoineds <- convertToWorkflowJoineds(workflowImports)
      deactivatedWorkflows = workflowJoineds.map(workflowJoined => workflowJoined.copy(isActive = false))
      _ <- workflowValidationService.validateOnInsert(deactivatedWorkflows)
      _ <- workflowRepository.insertWorkflows(deactivatedWorkflows, userName)
      projects <- getProjects()
    } yield {
      projects
    }
  }

  override def convertToWorkflowJoined(workflowImport: WorkflowImportExportWrapper)(implicit ec: ExecutionContext): Future[WorkflowJoined] = {
    convertToWorkflowJoineds(Seq(workflowImport)).transform(workflowJoineds =>
      if (workflowJoineds.size == 1) {
        workflowJoineds.head
      } else {
        throw new RuntimeException(s"Expected size 1, got ${workflowJoineds.size}")
      }, {
      case ex: ApiException => new ApiException(ex.apiErrors.map(_.unwrapError()))
    })
  }

  private def convertToWorkflowJoineds(workflowImports: Seq[WorkflowImportExportWrapper])(implicit ec: ExecutionContext): Future[Seq[WorkflowJoined]] = {
    resolveJobTemplates(workflowImports)
      .map(resetSchedulerInstanceId)
  }

  private def resolveJobTemplates(workflowImports: Seq[WorkflowImportExportWrapper])(implicit ec: ExecutionContext): Future[Seq[WorkflowJoined]] = {
    val jobTemplatesNames = workflowImports.flatMap(_.jobTemplates.map(_.name)).distinct
    jobTemplateService.getJobTemplateIdsByNames(jobTemplatesNames).flatMap {
      newNameIdMap =>
        val workflowJoinedsEit = workflowImports.map { workflowImport =>
          val oldIdNameMap = workflowImport.jobTemplates.map(jobTemplate => jobTemplate.id -> jobTemplate.name).toMap
          val missingTemplates = oldIdNameMap.values.toSet.diff(newNameIdMap.keySet)
          if (missingTemplates.nonEmpty) {
            Left(
              BulkOperationError(workflowImport.workflowJoined,
                GenericError(s"The following Job Templates don't exist yet and have to be created before importing" +
                  s" this workflow: ${missingTemplates.reduce(_ + ", " + _)}")))
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

            Right(workflowWithResolvedJobTemplateIds)
          }
        }

        if (workflowJoinedsEit.forall(_.isRight)) {
          Future {
            workflowJoinedsEit.map(_.right.get)
          }
        } else {
          val allErrors = workflowJoinedsEit
            .filter(_.isLeft)
            .map(_.left.get)
          Future.failed(new ApiException(allErrors))
        }
    }
  }

  private def resetSchedulerInstanceId(workflowJoineds: Seq[WorkflowJoined]): Seq[WorkflowJoined] = {
    workflowJoineds.map(_.copy(schedulerInstanceId = None))
  }

  private[services] def getUserName: () => String = {
    SecurityContextHolder.getContext.getAuthentication.getPrincipal.asInstanceOf[UserDetails].getUsername.toLowerCase
  }
}
