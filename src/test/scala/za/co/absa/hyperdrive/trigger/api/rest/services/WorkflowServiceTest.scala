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

import org.mockito.ArgumentMatchers.{eq => eqTo, _}
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers}
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses
import za.co.absa.hyperdrive.trigger.models.errors.ApiErrorTypes.ImportErrorType
import za.co.absa.hyperdrive.trigger.models.errors.{ApiError, DatabaseError, ValidationError}
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, WorkflowRepository}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ExecutionContext, Future}

class WorkflowServiceTest extends AsyncFlatSpec with Matchers with MockitoSugar with BeforeAndAfter {
  private val workflowRepository = mock[WorkflowRepository]
  private val dagInstanceRepository = mock[DagInstanceRepository]
  private val dagInstanceService = mock[DagInstanceService]
  private val jobTemplateService = mock[JobTemplateService]
  private val workflowValidationService = mock[WorkflowValidationService]
  private val userName = "fakeUserName"
  private val underTest = new WorkflowServiceImpl(workflowRepository, dagInstanceRepository, dagInstanceService, jobTemplateService, workflowValidationService){
    override private[services] def getUserName: () => String = () => userName
  }

  before {
    reset(workflowRepository)
    reset(dagInstanceRepository)
    reset(dagInstanceService)
    reset(jobTemplateService)
    reset(workflowValidationService)
  }

  "WorkflowService.createWorkflow" should "should create a workflow" in {
    // given
    val workflowJoined = WorkflowFixture.createWorkflowJoined()
    when(workflowValidationService.validateOnInsert(eqTo(workflowJoined))(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(workflowRepository.insertWorkflow(eqTo(workflowJoined), eqTo(userName))(any[ExecutionContext])).thenReturn(Future{Right(workflowJoined.id)})
    when(workflowRepository.getWorkflow(eqTo(workflowJoined.id))(any[ExecutionContext])).thenReturn(Future{workflowJoined})

    // when
    val result = await(underTest.createWorkflow(workflowJoined))

    // then
    verify(workflowRepository).insertWorkflow(eqTo(workflowJoined), eqTo(userName))(any[ExecutionContext])
    result shouldBe Right(workflowJoined)
  }

  it should "should return with errors if validation failed and not attempt to insert to DB" in {
    // given
    val workflowJoined = WorkflowFixture.createWorkflowJoined()
    val errors: Seq[ApiError] = Seq(ValidationError("error"))
    when(workflowValidationService.validateOnInsert(eqTo(workflowJoined))(any[ExecutionContext]))
      .thenReturn(Future{errors})

    // when
    val result = await(underTest.createWorkflow(workflowJoined))

    // then
    verify(workflowRepository, never()).insertWorkflow(any[WorkflowJoined], any[String])(any[ExecutionContext])
    verify(workflowRepository, never()).getWorkflow(any[Long])(any[ExecutionContext])
    result shouldBe Left(errors)
  }

  it should "should return with errors if DB insert failed" in {
    // given
    val workflowJoined = WorkflowFixture.createWorkflowJoined()
    val error = DatabaseError("error")
    when(workflowValidationService.validateOnInsert(eqTo(workflowJoined))(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(workflowRepository.insertWorkflow(eqTo(workflowJoined), eqTo(userName))(any[ExecutionContext]))
      .thenReturn(Future{Left(error)})

    // when
    val result = await(underTest.createWorkflow(workflowJoined))

    // then
    verify(workflowRepository).insertWorkflow(eqTo(workflowJoined), eqTo(userName))(any[ExecutionContext])
    verify(workflowRepository, never()).getWorkflow(any[Long])(any[ExecutionContext])
    result shouldBe Left(Seq(error))
  }

  "WorkflowService.updateWorkflow" should "should update a workflow" in {
    // given
    val originalWorkflow = WorkflowFixture.createWorkflowJoined()
    val updatedWorkflow = originalWorkflow.copy(name = "newName")

    when(workflowRepository.getWorkflow(eqTo(originalWorkflow.id))(any[ExecutionContext])).thenReturn(Future{originalWorkflow}).thenReturn(Future{updatedWorkflow})
    when(workflowValidationService.validateOnUpdate(eqTo(originalWorkflow), eqTo(updatedWorkflow))(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(workflowRepository.updateWorkflow(any[WorkflowJoined], any[String])(any[ExecutionContext])).thenReturn(Future{Right((): Unit)})

    // when
    val result = await(underTest.updateWorkflow(updatedWorkflow))

    // then
    verify(workflowRepository).updateWorkflow(any[WorkflowJoined], any[String])(any[ExecutionContext])
    result shouldBe Right(updatedWorkflow)
  }

  it should "should return with errors if validation failed and not attempt to update on DB" in {
    // given
    val originalJoined = WorkflowFixture.createWorkflowJoined()
    val workflowJoined = originalJoined.copy()
    val errors: Seq[ApiError] = Seq(ValidationError("error"))
    when(workflowValidationService.validateOnUpdate(eqTo(workflowJoined), eqTo(originalJoined))(any[ExecutionContext]))
      .thenReturn(Future{errors})
    when(workflowRepository.getWorkflow(eqTo(workflowJoined.id))(any[ExecutionContext])).thenReturn(Future{workflowJoined})

    // when
    val result = await(underTest.updateWorkflow(workflowJoined))

    // then
    verify(workflowRepository, never()).updateWorkflow(any[WorkflowJoined], any[String])(any[ExecutionContext])
    result shouldBe Left(errors)
  }

  it should "should return with errors if DB update failed" in {
    // given
    val originalWorkflow = WorkflowFixture.createWorkflowJoined()
    val updatedWorkflow = originalWorkflow.copy(project = "diff")

    val error = DatabaseError("error")
    when(workflowRepository.getWorkflow(eqTo(originalWorkflow.id))(any[ExecutionContext])).thenReturn(Future{originalWorkflow})
    when(workflowValidationService.validateOnUpdate(eqTo(originalWorkflow), eqTo(updatedWorkflow))(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(workflowRepository.updateWorkflow(any[WorkflowJoined], any[String])(any[ExecutionContext]))
      .thenReturn(Future{Left(error)})

    // when
    val result = await(underTest.updateWorkflow(updatedWorkflow))

    // then
    verify(workflowRepository).updateWorkflow(any[WorkflowJoined], any[String])(any[ExecutionContext])
    result shouldBe Left(Seq(error))
  }

  "WorkflowService.getProjects" should "should return no project on no workflows" in {
    // given
    when(workflowRepository.getWorkflows()(any[ExecutionContext])).thenReturn(Future{Seq()})

    // when
    val result: Seq[Project] = await(underTest.getProjects())

    // then
    verify(workflowRepository, times(1)).getWorkflows()
    result shouldBe Seq.empty[Project]
  }

  "WorkflowService.getProjects" should "should return projects on some workflows" in {
    // given
    val worfklows = Seq(
      Workflow(
        name = "worfklowA",
        isActive = true,
        project = "projectA",
        created = LocalDateTime.now(),
        updated = None,
        id = 0
      ),
      Workflow(
        name = "worfklowB",
        isActive = false,
        project = "projectB",
        created = LocalDateTime.now(),
        updated = None,
        id = 1
      )
    )
    when(workflowRepository.getWorkflows()(any[ExecutionContext])).thenReturn(Future{worfklows})

    // when
    val result: Seq[Project] = await(underTest.getProjects())

    // then
    verify(workflowRepository, times(1)).getWorkflows()
    result.length shouldBe 2
  }

  "WorkflowService.runWorkflowJobs" should "should insert joined dag instance when jobs ids exist in workflow" in {
    // given
    val workflowJoined = WorkflowFixture.createWorkflowJoined().copy()
    val workflowId = workflowJoined.id
    val jobIds = workflowJoined.dagDefinitionJoined.jobDefinitions.map(_.id)

    val dagInstanceJoined = createDagInstanceJoined()
    when(workflowRepository.getWorkflow(eqTo(workflowId))(any[ExecutionContext])).thenReturn(Future{workflowJoined})
    when(dagInstanceService.createDagInstance(any(), eqTo(userName), any())(any[ExecutionContext])).thenReturn(Future{dagInstanceJoined})
    when(dagInstanceRepository.insertJoinedDagInstance(eqTo(dagInstanceJoined))(any[ExecutionContext])).thenReturn(Future{(): Unit})

    // when
    val result: Boolean = await(underTest.runWorkflowJobs(workflowId, jobIds))

    // then
    verify(workflowRepository, times(1)).getWorkflow(any[Long])(any[ExecutionContext])
    verify(dagInstanceService, times(1)).createDagInstance(any(), eqTo(userName), any())(any[ExecutionContext])
    verify(dagInstanceRepository, times(1)).insertJoinedDagInstance(any[DagInstanceJoined])(any[ExecutionContext])
    result shouldBe true
  }

  "WorkflowService.runWorkflowJobs" should "should not insert joined dag instance when jobs ids does not exist in workflow" in {
    // given
    val workflowJoined = WorkflowFixture.createWorkflowJoined().copy()
    val workflowId = workflowJoined.id
    val jobIds: Seq[Long] = Seq(9999, 8888)
    val triggeredBy = "triggered by"

    when(workflowRepository.getWorkflow(eqTo(workflowId))(any[ExecutionContext])).thenReturn(Future{workflowJoined})
    when(dagInstanceRepository.insertJoinedDagInstance(any[DagInstanceJoined])(any[ExecutionContext])).thenReturn(Future{(): Unit})

    // when
    val result: Boolean = await(underTest.runWorkflowJobs(workflowId, jobIds))

    // then
    verify(workflowRepository, times(1)).getWorkflow(any[Long])(any[ExecutionContext])
    verify(dagInstanceService, never).createDagInstance(any[DagDefinitionJoined], eqTo(triggeredBy), any())(any[ExecutionContext])
    verify(dagInstanceRepository, never).insertJoinedDagInstance(any[DagInstanceJoined])(any[ExecutionContext])
    result shouldBe false
  }

  "WorkflowService.exportWorkflow" should "export workflow with referenced job templates" in {
    val workflowJoined = WorkflowFixture.createWorkflowJoined().copy()

    val jobTemplates = Seq(JobTemplateFixture.GenericShellJobTemplate, JobTemplateFixture.GenericSparkJobTemplate)
    when(workflowRepository.getWorkflow(eqTo(workflowJoined.id))(any[ExecutionContext])).thenReturn(Future{workflowJoined})
    when(jobTemplateService.getJobTemplatesByIds(any())(any[ExecutionContext])).thenReturn(Future{jobTemplates})

    val result = await(underTest.exportWorkflow(workflowJoined.id))

    result shouldBe WorkflowImportExportWrapper(workflowJoined, jobTemplates)
  }

  "WorkflowService.importWorkflow" should "match existing job templates by name and update job template ids" in {
    val workflowJoined = WorkflowFixture.createWorkflowJoined().copy()
    val oldJobTemplates = Seq(JobTemplateFixture.GenericSparkJobTemplate, JobTemplateFixture.GenericShellJobTemplate)
    val workflowImport = WorkflowImportExportWrapper(workflowJoined, oldJobTemplates)
    val newJobTemplates = Seq(
      JobTemplateFixture.GenericSparkJobTemplate.copy(id = 11),
      JobTemplateFixture.GenericShellJobTemplate.copy(id = 12)
    )
    val newJobTemplatesIdMap = newJobTemplates.map(t => t.name -> t.id).toMap
    when(jobTemplateService.getJobTemplateIdsByNames(any())(any[ExecutionContext])).thenReturn(Future{newJobTemplatesIdMap})

    val result = await(underTest.importWorkflow(workflowImport))

    result.isRight shouldBe true
    result.right.get.dagDefinitionJoined.jobDefinitions.head.jobTemplateId shouldBe 11
    result.right.get.dagDefinitionJoined.jobDefinitions(1).jobTemplateId shouldBe 12
  }

  it should "return an import error if the given job template doesn't exist" in {
    val workflowJoined = WorkflowFixture.createWorkflowJoined().copy()
    val oldJobTemplates = Seq(JobTemplateFixture.GenericSparkJobTemplate, JobTemplateFixture.GenericShellJobTemplate)
    val workflowImport = WorkflowImportExportWrapper(workflowJoined, oldJobTemplates)

    when(jobTemplateService.getJobTemplateIdsByNames(any())(any[ExecutionContext])).thenReturn(Future{Map[String, Long]()})

    val result = await(underTest.importWorkflow(workflowImport))

    result.isLeft shouldBe true
    result.left.get.head.errorType shouldBe ImportErrorType
    result.left.get.head.message should include(JobTemplateFixture.GenericSparkJobTemplate.name)
    result.left.get.head.message should include(JobTemplateFixture.GenericShellJobTemplate.name)
  }

  private def createDagInstanceJoined() = {
    DagInstanceJoined(
      status = DagInstanceStatuses.InQueue,
      triggeredBy = userName,
      workflowId = 2,
      jobInstances = Seq(),
      started = LocalDateTime.now(),
      finished = None,
      id = 3
    )
  }

}
