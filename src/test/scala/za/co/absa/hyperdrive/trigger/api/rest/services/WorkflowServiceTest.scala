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
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.{eq => eqTo, _}
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers}
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.configuration.application.TestGeneralConfig
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.enums.{DagInstanceStatuses, JobTypes}
import za.co.absa.hyperdrive.trigger.models.errors.ApiErrorTypes.{BulkOperationErrorType, GenericErrorType}
import za.co.absa.hyperdrive.trigger.models.errors.{ApiError, ApiException, DatabaseError, ValidationError}
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
  private val underTest = new WorkflowServiceImpl(workflowRepository, dagInstanceRepository, dagInstanceService,
    jobTemplateService, workflowValidationService, TestGeneralConfig()){
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
    when(workflowValidationService.validateOnInsert(eqTo(workflowJoined))(any[ExecutionContext])).thenReturn(Future{(): Unit})
    when(workflowRepository.insertWorkflow(eqTo(workflowJoined), eqTo(userName))(any[ExecutionContext])).thenReturn(Future{workflowJoined.id})
    when(workflowRepository.getWorkflow(eqTo(workflowJoined.id))(any[ExecutionContext])).thenReturn(Future{workflowJoined})

    // when
    val result = await(underTest.createWorkflow(workflowJoined))

    // then
    verify(workflowRepository).insertWorkflow(eqTo(workflowJoined), eqTo(userName))(any[ExecutionContext])
    result shouldBe workflowJoined
  }

  it should "should return with errors if validation failed and not attempt to insert to DB" in {
    // given
    val workflowJoined = WorkflowFixture.createWorkflowJoined()
    val errors: Seq[ApiError] = Seq(ValidationError("error"))
    when(workflowValidationService.validateOnInsert(eqTo(workflowJoined))(any[ExecutionContext]))
      .thenReturn(Future.failed(new ApiException(errors)))

    // when
    val result = the [ApiException] thrownBy await(underTest.createWorkflow(workflowJoined))

    // then
    verify(workflowRepository, never()).insertWorkflow(any[WorkflowJoined], any[String])(any[ExecutionContext])
    verify(workflowRepository, never()).getWorkflow(any[Long])(any[ExecutionContext])
    result.apiErrors should contain theSameElementsAs errors
  }

  it should "should return with errors if DB insert failed" in {
    // given
    val workflowJoined = WorkflowFixture.createWorkflowJoined()
    val error = DatabaseError("error")
    when(workflowValidationService.validateOnInsert(eqTo(workflowJoined))(any[ExecutionContext])).thenReturn(Future{(): Unit})
    when(workflowRepository.insertWorkflow(eqTo(workflowJoined), eqTo(userName))(any[ExecutionContext]))
      .thenReturn(Future.failed(new ApiException(error)))

    // when
    val result = the [ApiException] thrownBy await(underTest.createWorkflow(workflowJoined))

    // then
    verify(workflowRepository).insertWorkflow(eqTo(workflowJoined), eqTo(userName))(any[ExecutionContext])
    verify(workflowRepository, never()).getWorkflow(any[Long])(any[ExecutionContext])
    result.apiErrors should have size 1
    result.apiErrors.head shouldBe error
  }

  "WorkflowService.updateWorkflow" should "should update a workflow" in {
    // given
    val originalWorkflow = WorkflowFixture.createWorkflowJoined()
    val updatedWorkflow = originalWorkflow.copy(name = "newName")

    when(workflowRepository.getWorkflow(eqTo(originalWorkflow.id))(any[ExecutionContext])).thenReturn(Future{originalWorkflow}).thenReturn(Future{updatedWorkflow})
    when(workflowValidationService.validateOnUpdate(eqTo(originalWorkflow), eqTo(updatedWorkflow))(any[ExecutionContext])).thenReturn(Future{})
    when(workflowRepository.updateWorkflow(any[WorkflowJoined], any[String])(any[ExecutionContext])).thenReturn(Future{(): Unit})

    // when
    val result = await(underTest.updateWorkflow(updatedWorkflow))

    // then
    verify(workflowRepository).updateWorkflow(any[WorkflowJoined], any[String])(any[ExecutionContext])
    result shouldBe updatedWorkflow
  }

  it should "should return with errors if validation failed and not attempt to update on DB" in {
    // given
    val originalJoined = WorkflowFixture.createWorkflowJoined()
    val workflowJoined = originalJoined.copy()
    val errors: Seq[ApiError] = Seq(ValidationError("error"))
    when(workflowValidationService.validateOnUpdate(eqTo(workflowJoined), eqTo(originalJoined))(any[ExecutionContext]))
      .thenReturn(Future.failed(new ApiException(errors)))
    when(workflowRepository.getWorkflow(eqTo(workflowJoined.id))(any[ExecutionContext])).thenReturn(Future{workflowJoined})

    // when
    val result = the [ApiException] thrownBy await(underTest.updateWorkflow(workflowJoined))

    // then
    verify(workflowRepository, never()).updateWorkflow(any[WorkflowJoined], any[String])(any[ExecutionContext])
    result.apiErrors should contain theSameElementsAs errors
  }

  it should "should return with errors if DB update failed" in {
    // given
    val originalWorkflow = WorkflowFixture.createWorkflowJoined()
    val updatedWorkflow = originalWorkflow.copy(project = "diff")

    val error = DatabaseError("error")
    when(workflowRepository.getWorkflow(eqTo(originalWorkflow.id))(any[ExecutionContext])).thenReturn(Future{originalWorkflow})
    when(workflowValidationService.validateOnUpdate(eqTo(originalWorkflow), eqTo(updatedWorkflow))(any[ExecutionContext])).thenReturn(Future{})
    when(workflowRepository.updateWorkflow(any[WorkflowJoined], any[String])(any[ExecutionContext]))
      .thenReturn(Future.failed(new ApiException(error)))

    // when
    val result = the [ApiException] thrownBy await(underTest.updateWorkflow(updatedWorkflow))

    // then
    verify(workflowRepository).updateWorkflow(any[WorkflowJoined], any[String])(any[ExecutionContext])
    result.apiErrors should have size 1
    result.apiErrors.head shouldBe error
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
    val workflows = Seq(
      Workflow(
        name = "workflowA",
        isActive = true,
        project = "projectA",
        created = LocalDateTime.now(),
        updated = None,
        id = 0
      ),
      Workflow(
        name = "workflowB",
        isActive = false,
        project = "projectB",
        created = LocalDateTime.now(),
        updated = None,
        id = 1
      )
    )
    when(workflowRepository.getWorkflows()(any[ExecutionContext])).thenReturn(Future{workflows})

    // when
    val result: Seq[Project] = await(underTest.getProjects())

    // then
    verify(workflowRepository, times(1)).getWorkflows()
    result.length shouldBe 2
  }

  "WorkflowService.runWorkflows" should "insert joined dag instance" in {
    // given
    val workflowJoineds = Seq(WorkflowFixture.createWorkflowJoined().copy(id = 1), WorkflowFixture.createWorkflowJoined().copy(id = 2))
    val workflowIds = workflowJoineds.map(_.id)

    val dagInstanceJoinedOne = createDagInstanceJoined().copy(id = 1)
    val dagInstanceJoinedTwo = createDagInstanceJoined().copy(id = 2)

    when(workflowRepository.getWorkflows(eqTo(workflowIds))(any[ExecutionContext])).thenReturn(Future{workflowJoineds})
    when(dagInstanceService.createDagInstance(any(), eqTo(userName), any())(any[ExecutionContext])).thenReturn(Future{dagInstanceJoinedOne}).thenReturn(Future{dagInstanceJoinedTwo})
    when(dagInstanceRepository.insertJoinedDagInstances(eqTo(Seq(dagInstanceJoinedOne, dagInstanceJoinedTwo)))(any[ExecutionContext])).thenReturn(Future{(): Unit})

    // when
    val result: Boolean = await(underTest.runWorkflows(workflowIds))

    // then
    verify(workflowRepository, times(1)).getWorkflows(any[Seq[Long]])(any[ExecutionContext])
    verify(dagInstanceService, times(2)).createDagInstance(any(), eqTo(userName), any())(any[ExecutionContext])
    verify(dagInstanceRepository, times(1)).insertJoinedDagInstances(any[Seq[DagInstanceJoined]])(any[ExecutionContext])
    result shouldBe true
  }

  "WorkflowService.runWorkflowJobs" should "insert joined dag instance when jobs ids exist in workflow" in {
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

  it should "should insert only selected jobs ids of dag instance" in {
    // given
    val workflowJoined = WorkflowFixture.createWorkflowJoined().copy()
    val workflowId = workflowJoined.id
    val jobId = workflowJoined.dagDefinitionJoined.jobDefinitions.head.id
    val jobIds = Seq(jobId)

    val dagInstanceJoined = createDagInstanceJoined()
    when(workflowRepository.getWorkflow(eqTo(workflowId))(any[ExecutionContext])).thenReturn(Future{workflowJoined})
    when(dagInstanceService.createDagInstance(any(), eqTo(userName), any())(any[ExecutionContext])).thenReturn(Future{dagInstanceJoined})
    when(dagInstanceRepository.insertJoinedDagInstance(eqTo(dagInstanceJoined))(any[ExecutionContext])).thenReturn(Future{(): Unit})

    // when
    val result: Boolean = await(underTest.runWorkflowJobs(workflowId, jobIds))

    // then
    val dagDefinitionCaptor: ArgumentCaptor[DagDefinitionJoined] = ArgumentCaptor.forClass(classOf[DagDefinitionJoined])
    verify(workflowRepository, times(1)).getWorkflow(any[Long])(any[ExecutionContext])
    verify(dagInstanceService, times(1)).createDagInstance(dagDefinitionCaptor.capture(), eqTo(userName), any())(any[ExecutionContext])
    verify(dagInstanceRepository, times(1)).insertJoinedDagInstance(any[DagInstanceJoined])(any[ExecutionContext])
    dagDefinitionCaptor.getValue.jobDefinitions.size shouldBe 1
    dagDefinitionCaptor.getValue.jobDefinitions.head.id shouldBe jobId
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

  "WorkflowService.exportWorkflows" should "export workflow with referenced job templates" in {
    // given
    val workflowJoined1 = WorkflowFixture.createWorkflowJoined().copy()
    val workflowJoined2 = WorkflowFixture.createTimeBasedShellScriptWorkflow("project").copy()
    val jobTemplates1 = Seq(JobTemplateFixture.GenericSparkJobTemplate, JobTemplateFixture.GenericShellJobTemplate)
    val jobTemplates2 = Seq(JobTemplateFixture.GenericShellJobTemplate)
    val jobTemplates = (jobTemplates1 ++ jobTemplates2).distinct

    when(workflowRepository.getWorkflows(any())(any())).thenReturn(Future{Seq(workflowJoined1, workflowJoined2)})
    when(jobTemplateService.getJobTemplatesByIds(any())(any[ExecutionContext])).thenReturn(Future{jobTemplates})

    // when
    val result = await(underTest.exportWorkflows(Seq(workflowJoined1.id, workflowJoined2.id)))

    result should contain theSameElementsAs Seq(
      WorkflowImportExportWrapper(workflowJoined1, jobTemplates1),
      WorkflowImportExportWrapper(workflowJoined2, jobTemplates2)
    )
  }

  "WorkflowService.importWorkflows" should "import workflows and return projects" in {
    // given
    val workflowJoined1 = WorkflowFixture.createWorkflowJoined().copy(schedulerInstanceId = Some(42))
    val workflowJoined2 = WorkflowFixture.createTimeBasedShellScriptWorkflow("project").copy()
    val jobTemplates1 = Seq(JobTemplateFixture.GenericSparkJobTemplate, JobTemplateFixture.GenericShellJobTemplate)
    val jobTemplates2 = Seq(JobTemplateFixture.GenericShellJobTemplate)
    val workflowImports = Seq(
      WorkflowImportExportWrapper(workflowJoined1, jobTemplates1),
      WorkflowImportExportWrapper(workflowJoined2, jobTemplates2)
    )
    val newJobTemplates = Seq(
      JobTemplateFixture.GenericSparkJobTemplate.copy(id = 11),
      JobTemplateFixture.GenericShellJobTemplate.copy(id = 12)
    )
    val newJobTemplatesIdMap = newJobTemplates.map(t => t.name -> t.id).toMap

    val workflows = workflowImports.map(_.workflowJoined.toWorkflow)
    val expectedProjects = Seq(
      Project(workflowJoined1.project, Seq(workflowJoined1.toWorkflow)),
      Project(workflowJoined2.project, Seq(workflowJoined2.toWorkflow))
    )
    when(jobTemplateService.getJobTemplateIdsByNames(any())(any[ExecutionContext])).thenReturn(Future{newJobTemplatesIdMap})
    when(workflowValidationService.validateOnInsert(any[Seq[WorkflowJoined]])(any())).thenReturn(Future{})
    when(workflowRepository.insertWorkflows(any(), any())(any())).thenReturn(Future { Seq(21L, 22L) })
    when(workflowRepository.getWorkflows()(any[ExecutionContext])).thenReturn(Future{workflows})

    // when
    val actualProjects = await(underTest.importWorkflows(workflowImports))

    // then
    actualProjects should contain theSameElementsAs expectedProjects
    val stringsCaptor: ArgumentCaptor[Seq[String]] = ArgumentCaptor.forClass(classOf[Seq[String]])
    verify(jobTemplateService).getJobTemplateIdsByNames(stringsCaptor.capture())(any())
    stringsCaptor.getValue should contain theSameElementsAs workflowImports.flatMap(_.jobTemplates.map(_.name)).distinct

    val validateOnInsertCaptor: ArgumentCaptor[Seq[WorkflowJoined]] = ArgumentCaptor.forClass(classOf[Seq[WorkflowJoined]])
    verify(workflowValidationService).validateOnInsert(validateOnInsertCaptor.capture())(any())
    val convertedWorkflows = validateOnInsertCaptor.getValue
    convertedWorkflows.head.dagDefinitionJoined.jobDefinitions.flatMap(_.jobTemplateId) should contain theSameElementsInOrderAs Seq(11, 12)
    convertedWorkflows(1).dagDefinitionJoined.jobDefinitions.head.jobTemplateId.get shouldBe 12

    val insertWorkflowsCaptor: ArgumentCaptor[Seq[WorkflowJoined]] = ArgumentCaptor.forClass(classOf[Seq[WorkflowJoined]])
    verify(workflowRepository).insertWorkflows(insertWorkflowsCaptor.capture(), eqTo(userName))(any())
    val workflowsToInsert = insertWorkflowsCaptor.getValue
    workflowsToInsert should have size workflowImports.size
    workflowsToInsert.map(_.name) should contain theSameElementsAs workflowImports.map(_.workflowJoined.name)
    workflowsToInsert.map(_.isActive) should contain only false
    workflowsToInsert.map(_.schedulerInstanceId) should contain only None
  }

  it should "fail with all job template conversion errors" in {
    // given
    val workflowJoined1 = WorkflowFixture.createWorkflowJoined().copy()
    val workflowJoined2 = WorkflowFixture.createTimeBasedShellScriptWorkflow("project").copy()
    val jobTemplates1 = Seq(JobTemplateFixture.GenericSparkJobTemplate, JobTemplateFixture.GenericShellJobTemplate)
    val jobTemplates2 = Seq(JobTemplateFixture.GenericShellJobTemplate)
    val workflowImports = Seq(
      WorkflowImportExportWrapper(workflowJoined1, jobTemplates1),
      WorkflowImportExportWrapper(workflowJoined2, jobTemplates2)
    )

    when(jobTemplateService.getJobTemplateIdsByNames(any())(any[ExecutionContext])).thenReturn(Future{Map[String, Long]()})

    // when
    val result = the [ApiException] thrownBy await(underTest.importWorkflows(workflowImports))

    // then
    result.apiErrors should have size 2
    result.apiErrors.head.errorType shouldBe BulkOperationErrorType
    result.apiErrors.head.message should include(workflowJoined1.name)
    result.apiErrors.head.message should include(JobTemplateFixture.GenericSparkJobTemplate.name)
    result.apiErrors.head.message should include(JobTemplateFixture.GenericShellJobTemplate.name)

    result.apiErrors(1).errorType shouldBe BulkOperationErrorType
    result.apiErrors(1).message should include(workflowJoined2.name)
    result.apiErrors(1).message should include(JobTemplateFixture.GenericShellJobTemplate.name)
  }

  it should "fail in case of validation errors" in {
    // given
    val workflowJoined1 = WorkflowFixture.createWorkflowJoined().copy()
    val workflowJoined2 = WorkflowFixture.createTimeBasedShellScriptWorkflow("project").copy()
    val jobTemplates1 = Seq(JobTemplateFixture.GenericSparkJobTemplate, JobTemplateFixture.GenericShellJobTemplate)
    val jobTemplates2 = Seq(JobTemplateFixture.GenericShellJobTemplate)
    val workflowImports = Seq(
      WorkflowImportExportWrapper(workflowJoined1, jobTemplates1),
      WorkflowImportExportWrapper(workflowJoined2, jobTemplates2)
    )

    val newJobTemplates = Seq(
      JobTemplateFixture.GenericSparkJobTemplate.copy(id = 11),
      JobTemplateFixture.GenericShellJobTemplate.copy(id = 12)
    )
    val newJobTemplatesIdMap = newJobTemplates.map(t => t.name -> t.id).toMap

    val error = Seq(ValidationError("validationError"), ValidationError("validationError2"))

    when(jobTemplateService.getJobTemplateIdsByNames(any())(any[ExecutionContext])).thenReturn(Future{newJobTemplatesIdMap})
    when(workflowValidationService.validateOnInsert(any[Seq[WorkflowJoined]])(any()))
      .thenReturn(Future.failed(new ApiException(error)))

    // when
    val result = the [ApiException] thrownBy await(underTest.importWorkflows(workflowImports))

    // then
    result.apiErrors should contain theSameElementsAs error
  }

  it should "return an import error only for the workflows with missing templates" in {
    // given
    val workflowJoined1 = WorkflowFixture.createWorkflowJoined().copy()
    val workflowJoined2 = WorkflowFixture.createTimeBasedShellScriptWorkflow("project").copy()
    val jobTemplates1 = Seq(JobTemplateFixture.GenericSparkJobTemplate, JobTemplateFixture.GenericShellJobTemplate)
    val jobTemplates2 = Seq(JobTemplateFixture.GenericShellJobTemplate)

    val workflowImport = Seq(
      WorkflowImportExportWrapper(workflowJoined1, jobTemplates1),
      WorkflowImportExportWrapper(workflowJoined2, jobTemplates2)
    )
    val newJobTemplates = Seq(
      JobTemplateFixture.GenericShellJobTemplate.copy(id = 12)
    )
    val newJobTemplatesIdMap = newJobTemplates.map(t => t.name -> t.id).toMap
    when(jobTemplateService.getJobTemplateIdsByNames(any())(any[ExecutionContext])).thenReturn(Future{newJobTemplatesIdMap})

    // when
    val result = the [ApiException] thrownBy await(underTest.importWorkflows(workflowImport))

    // then
    result.apiErrors should have size 1
    result.apiErrors.head.errorType shouldBe BulkOperationErrorType
    result.apiErrors.head.message should include(workflowJoined1.name)
    result.apiErrors.head.message should include(JobTemplateFixture.GenericSparkJobTemplate.name)
  }

  "WorkflowService.convertToWorkflowJoined" should "match existing job templates by name and update job template ids" in {
    val workflowJoined = WorkflowFixture.createWorkflowJoined().copy(schedulerInstanceId = Some(98))
    val oldJobTemplates = Seq(JobTemplateFixture.GenericSparkJobTemplate, JobTemplateFixture.GenericShellJobTemplate)
    val workflowImport = WorkflowImportExportWrapper(workflowJoined, oldJobTemplates)
    val newJobTemplates = Seq(
      JobTemplateFixture.GenericSparkJobTemplate.copy(id = 11),
      JobTemplateFixture.GenericShellJobTemplate.copy(id = 12)
    )
    val newJobTemplatesIdMap = newJobTemplates.map(t => t.name -> t.id).toMap
    when(jobTemplateService.getJobTemplateIdsByNames(any())(any[ExecutionContext])).thenReturn(Future{newJobTemplatesIdMap})

    val result = await(underTest.convertToWorkflowJoined(workflowImport))

    result.dagDefinitionJoined.jobDefinitions.head.jobTemplateId.get shouldBe 11
    result.dagDefinitionJoined.jobDefinitions(1).jobTemplateId.get shouldBe 12
    result.schedulerInstanceId shouldBe None
  }

  it should "return an import error if the given job template doesn't exist" in {
    val workflowJoined = WorkflowFixture.createWorkflowJoined().copy()
    val oldJobTemplates = Seq(JobTemplateFixture.GenericSparkJobTemplate, JobTemplateFixture.GenericShellJobTemplate)
    val workflowImport = WorkflowImportExportWrapper(workflowJoined, oldJobTemplates)

    when(jobTemplateService.getJobTemplateIdsByNames(any())(any[ExecutionContext])).thenReturn(Future{Map[String, Long]()})

    val result = the [ApiException] thrownBy await(underTest.convertToWorkflowJoined(workflowImport))

    result.apiErrors.head.errorType shouldBe GenericErrorType
    result.apiErrors.head.message should include(JobTemplateFixture.GenericSparkJobTemplate.name)
    result.apiErrors.head.message should include(JobTemplateFixture.GenericShellJobTemplate.name)
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
