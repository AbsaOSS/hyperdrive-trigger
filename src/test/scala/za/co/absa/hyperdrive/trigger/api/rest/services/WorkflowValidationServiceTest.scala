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

import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.{eq => eqTo, _}
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers}
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.models.KafkaSensorProperties
import za.co.absa.hyperdrive.trigger.models.errors.{ApiError, ApiException, BulkOperationError, ValidationError}
import za.co.absa.hyperdrive.trigger.persistance.WorkflowRepository

import scala.collection.immutable.SortedMap
import scala.concurrent.{ExecutionContext, Future}

class WorkflowValidationServiceTest extends AsyncFlatSpec with Matchers with MockitoSugar with BeforeAndAfter {
  override implicit def executionContext: ExecutionContext = scala.concurrent.ExecutionContext.Implicits.global

  private val workflowRepository = mock[WorkflowRepository]
  private val jobTemplateService = mock[JobTemplateService]

  before {
    reset(workflowRepository)
  }

  "validateOnInsert" should "return None if entity is valid" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository, jobTemplateService)
    val workflowJoined = WorkflowFixture.createWorkflowJoined()

    when(workflowRepository.existsWorkflows(eqTo(Seq(workflowJoined.name)))(any[ExecutionContext])).thenReturn(Future {
      Seq()
    })
    when(jobTemplateService.getJobTemplate(eqTo(JobTemplateFixture.GenericSparkJobTemplate.id))(any[ExecutionContext]))
      .thenReturn(Future(JobTemplateFixture.GenericSparkJobTemplate))
    when(jobTemplateService.getJobTemplate(eqTo(JobTemplateFixture.GenericShellJobTemplate.id))(any[ExecutionContext]))
      .thenReturn(Future(JobTemplateFixture.GenericShellJobTemplate))
    // when
    await(underTest.validateOnInsert(workflowJoined))

    // then
    // should not throw an exception
    1 shouldBe 1
  }

  "validateOnInsert" should "return None if all entities are valid" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository, jobTemplateService)
    val workflows = Seq(WorkflowFixture.createWorkflowJoined(), WorkflowFixture.createTimeBasedShellScriptWorkflow("p"))
    when(workflowRepository.existsWorkflows(any())(any[ExecutionContext])).thenReturn(Future(Seq()))
    when(jobTemplateService.getJobTemplate(eqTo(JobTemplateFixture.GenericSparkJobTemplate.id))(any[ExecutionContext]))
      .thenReturn(Future(JobTemplateFixture.GenericSparkJobTemplate))
    when(jobTemplateService.getJobTemplate(eqTo(JobTemplateFixture.GenericShellJobTemplate.id))(any[ExecutionContext]))
      .thenReturn(Future(JobTemplateFixture.GenericShellJobTemplate))

    // when
    await(underTest.validateOnInsert(workflows))

    // then
    val stringsCaptor: ArgumentCaptor[Seq[String]] = ArgumentCaptor.forClass(classOf[Seq[String]])
    verify(workflowRepository).existsWorkflows(stringsCaptor.capture())(any())
    stringsCaptor.getValue should contain theSameElementsAs workflows.map(_.name)
  }

  it should "fail if one of the workflow names already exists" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository, jobTemplateService)
    val workflow1 = WorkflowFixture.createWorkflowJoined()
    val workflows = Seq(workflow1, WorkflowFixture.createTimeBasedShellScriptWorkflow("p"))
    when(workflowRepository.existsWorkflows(any())(any[ExecutionContext])).thenReturn(Future(Seq(workflow1.name)))
    when(jobTemplateService.getJobTemplate(eqTo(JobTemplateFixture.GenericSparkJobTemplate.id))(any[ExecutionContext]))
      .thenReturn(Future(JobTemplateFixture.GenericSparkJobTemplate))
    when(jobTemplateService.getJobTemplate(eqTo(JobTemplateFixture.GenericShellJobTemplate.id))(any[ExecutionContext]))
      .thenReturn(Future(JobTemplateFixture.GenericShellJobTemplate))

    // when
    val result = the[ApiException] thrownBy await(underTest.validateOnInsert(workflows))

    // then
    result.apiErrors should have size 1
    result.apiErrors.head shouldBe BulkOperationError(workflow1, ValidationError("Workflow name already exists"))
  }

  it should "fail if one of the project names is empty" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository, jobTemplateService)
    val workflow = WorkflowFixture.createWorkflowJoined()
    val invalidWorkflow = workflow.copy(project = "")
    val workflows = Seq(workflow, invalidWorkflow)
    when(workflowRepository.existsWorkflows(any())(any[ExecutionContext])).thenReturn(Future(Seq()))
    when(jobTemplateService.getJobTemplate(eqTo(JobTemplateFixture.GenericSparkJobTemplate.id))(any[ExecutionContext]))
      .thenReturn(Future(JobTemplateFixture.GenericSparkJobTemplate))
    when(jobTemplateService.getJobTemplate(eqTo(JobTemplateFixture.GenericShellJobTemplate.id))(any[ExecutionContext]))
      .thenReturn(Future(JobTemplateFixture.GenericShellJobTemplate))

    // when
    val result = the[ApiException] thrownBy await(underTest.validateOnInsert(workflows))

    // then
    result.apiErrors should have size 1
    result.apiErrors.head shouldBe BulkOperationError(invalidWorkflow, ValidationError("Project must not be empty"))
  }

  it should "fail and report all errors" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository, jobTemplateService)
    val workflow = WorkflowFixture.createWorkflowJoined().copy(name = "workflow")
    val invalidWorkflow = workflow.copy(name = "invalidWorkflow", project = null)
    val invalidWorkflow2 = workflow.copy(name = "invalidWorkflow2", project = "")
    when(workflowRepository.existsWorkflows(any())(any[ExecutionContext])).thenReturn(Future {
      Seq(invalidWorkflow2.name)
    })

    when(jobTemplateService.getJobTemplate(eqTo(JobTemplateFixture.GenericSparkJobTemplate.id))(any[ExecutionContext]))
      .thenReturn(Future(JobTemplateFixture.GenericSparkJobTemplate))
    when(jobTemplateService.getJobTemplate(eqTo(JobTemplateFixture.GenericShellJobTemplate.id))(any[ExecutionContext]))
      .thenReturn(Future(JobTemplateFixture.GenericShellJobTemplate))

    // when
    val workflows = Seq(workflow, invalidWorkflow, invalidWorkflow2)
    val result = the[ApiException] thrownBy await(underTest.validateOnInsert(workflows))

    // then
    result.apiErrors should have size 3
    result.apiErrors should contain theSameElementsAs Seq(
      BulkOperationError(invalidWorkflow, ValidationError("Project must be set")),
      BulkOperationError(invalidWorkflow2, ValidationError("Project must not be empty")),
      BulkOperationError(invalidWorkflow2, ValidationError("Workflow name already exists"))
    )
  }

  it should "fail if job template and job definition types are not equal" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository, jobTemplateService)
    val workflowJoined = WorkflowFixture.createWorkflowJoined()
    val sparkJobTemplate = JobTemplateFixture.GenericSparkJobTemplate
    val shellJobTemplate = JobTemplateFixture.GenericShellJobTemplate
    val sparkJobTemplateWithShellId = sparkJobTemplate.copy(id = shellJobTemplate.id)
    val shellJobTemplateWithSparkId = sparkJobTemplate.copy(id = sparkJobTemplate.id)

    when(workflowRepository.existsWorkflows(eqTo(Seq(workflowJoined.name)))(any[ExecutionContext])).thenReturn(Future {
      Seq()
    })
    when(jobTemplateService.getJobTemplate(eqTo(sparkJobTemplateWithShellId.id))(any[ExecutionContext]))
      .thenReturn(Future(sparkJobTemplateWithShellId))
    when(jobTemplateService.getJobTemplate(eqTo(shellJobTemplateWithSparkId.id))(any[ExecutionContext]))
      .thenReturn(Future(shellJobTemplateWithSparkId))
    // when
    val result = the[ApiException] thrownBy await(underTest.validateOnInsert(workflowJoined))

    // then
    result.apiErrors should have size 1
    result.apiErrors should contain theSameElementsAs Seq(
      ValidationError(
        "Template's job type has to be the same as job's job type. Template - Spark is not equal to Job - Shell"
      )
    )
  }

  it should "fail if mandatory fields are empty - Shell" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository, jobTemplateService)
    val workflowJoined = WorkflowFixture.createShellScriptJobWithoutTemplateAndScript()

    when(workflowRepository.existsWorkflows(eqTo(Seq(workflowJoined.name)))(any[ExecutionContext])).thenReturn(Future {
      Seq()
    })

    // when
    val result = the[ApiException] thrownBy await(underTest.validateOnInsert(workflowJoined))

    // then
    result.apiErrors should have size 1
    println(result.apiErrors.head.message)
    result.apiErrors should contain theSameElementsAs Seq(
      ValidationError("Script location cannot be empty in case of Shell job type when template is empty")
    )
  }

  it should "fail if mandatory fields are empty - Spark" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository, jobTemplateService)
    val workflowJoined = WorkflowFixture.createSparkJobWithoutTemplateAndJar()

    when(workflowRepository.existsWorkflows(eqTo(Seq(workflowJoined.name)))(any[ExecutionContext])).thenReturn(Future {
      Seq()
    })

    // when
    val result = the[ApiException] thrownBy await(underTest.validateOnInsert(workflowJoined))

    // then
    result.apiErrors should have size 1
    println(result.apiErrors.head.message)
    result.apiErrors should contain theSameElementsAs Seq(
      ValidationError("Job jar and main class cannot be empty in case of Spark job type when template is empty")
    )
  }

  "validateOnUpdate" should "return None if entity is valid" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository, jobTemplateService)
    val originalWorkflow = WorkflowFixture.createWorkflowJoined()
    val updatedWorkflow = originalWorkflow.copy(name = "diff")
    when(
      workflowRepository
        .existsOtherWorkflow(eqTo(updatedWorkflow.name), eqTo(updatedWorkflow.id))(any[ExecutionContext])
    ).thenReturn(Future(false))

    when(jobTemplateService.getJobTemplate(eqTo(JobTemplateFixture.GenericSparkJobTemplate.id))(any[ExecutionContext]))
      .thenReturn(Future(JobTemplateFixture.GenericSparkJobTemplate))
    when(jobTemplateService.getJobTemplate(eqTo(JobTemplateFixture.GenericShellJobTemplate.id))(any[ExecutionContext]))
      .thenReturn(Future(JobTemplateFixture.GenericShellJobTemplate))

    // when
    await(underTest.validateOnUpdate(originalWorkflow, updatedWorkflow))

    // then
    // should not throw an exception
    1 shouldBe 1
  }

  it should "fail if the workflow name already exists in another entity" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository, jobTemplateService)
    val originalWorkflow = WorkflowFixture.createWorkflowJoined()
    val updatedWorkflow = originalWorkflow.copy(name = "differentName")
    when(
      workflowRepository
        .existsOtherWorkflow(eqTo(updatedWorkflow.name), eqTo(updatedWorkflow.id))(any[ExecutionContext])
    ).thenReturn(Future(true))

    when(jobTemplateService.getJobTemplate(eqTo(JobTemplateFixture.GenericSparkJobTemplate.id))(any[ExecutionContext]))
      .thenReturn(Future(JobTemplateFixture.GenericSparkJobTemplate))
    when(jobTemplateService.getJobTemplate(eqTo(JobTemplateFixture.GenericShellJobTemplate.id))(any[ExecutionContext]))
      .thenReturn(Future(JobTemplateFixture.GenericShellJobTemplate))

    // when
    val result = the[ApiException] thrownBy await(underTest.validateOnUpdate(originalWorkflow, updatedWorkflow))

    // then
    result.apiErrors should have size 1
    result.apiErrors.head shouldBe ValidationError("Workflow name already exists")
  }

  it should "fail if the project name is empty" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository, jobTemplateService)
    val originalWorkflow = WorkflowFixture.createWorkflowJoined()
    val updatedWorkflow = originalWorkflow.copy(project = "")
    when(
      workflowRepository
        .existsOtherWorkflow(eqTo(updatedWorkflow.name), eqTo(updatedWorkflow.id))(any[ExecutionContext])
    ).thenReturn(Future(false))

    when(jobTemplateService.getJobTemplate(eqTo(JobTemplateFixture.GenericSparkJobTemplate.id))(any[ExecutionContext]))
      .thenReturn(Future(JobTemplateFixture.GenericSparkJobTemplate))
    when(jobTemplateService.getJobTemplate(eqTo(JobTemplateFixture.GenericShellJobTemplate.id))(any[ExecutionContext]))
      .thenReturn(Future(JobTemplateFixture.GenericShellJobTemplate))

    // when
    val result = the[ApiException] thrownBy await(underTest.validateOnUpdate(originalWorkflow, updatedWorkflow))

    // then
    result.apiErrors should have size 1
    result.apiErrors.head shouldBe ValidationError("Project must not be empty")
  }

  "areMapsEqual" should "return true if maps contain same elements otherwise false" in {
    // given
    val mapEmpty = Map.empty[String, List[String]]
    val mapOne = Map("aa" -> List("11", "22"), "bb" -> List("33"))
    val mapTwo = Map("bb" -> List("33"), "aa" -> List("11", "22"))
    val mapThree = Map("cc" -> List("44", "55"))

    val underTest = new WorkflowValidationServiceImpl(workflowRepository, jobTemplateService)

    // then
    underTest.areMapsEqual(mapEmpty, mapEmpty) shouldBe true
    underTest.areMapsEqual(mapEmpty, mapOne) shouldBe false
    underTest.areMapsEqual(mapOne, mapEmpty) shouldBe false
    underTest.areMapsEqual(mapOne, mapThree) shouldBe false
    underTest.areMapsEqual(mapThree, mapOne) shouldBe false
    underTest.areMapsEqual(mapOne, mapOne) shouldBe true
    underTest.areMapsEqual(mapOne, mapTwo) shouldBe true
    underTest.areMapsEqual(mapTwo, mapOne) shouldBe true
    underTest.areMapsEqual(mapThree, mapThree) shouldBe true
  }

  "areMapsOfMapsEqual" should "return true if maps contain same elements otherwise false" in {
    // given
    val mapEmpty = Map.empty[String, SortedMap[String, String]]
    val mapOne = Map("aa" -> SortedMap("11" -> "22", "33" -> "44"), "bb" -> SortedMap("55" -> "66"))
    val mapTwo = Map("bb" -> SortedMap("55" -> "66"), "aa" -> SortedMap("11" -> "22", "33" -> "44"))
    val mapThree = Map("cc" -> SortedMap("77" -> "88"))

    val underTest = new WorkflowValidationServiceImpl(workflowRepository, jobTemplateService)

    // then
    underTest.areMapsOfMapsEqual(mapEmpty, mapEmpty) shouldBe true
    underTest.areMapsOfMapsEqual(mapEmpty, mapOne) shouldBe false
    underTest.areMapsOfMapsEqual(mapOne, mapEmpty) shouldBe false
    underTest.areMapsOfMapsEqual(mapOne, mapThree) shouldBe false
    underTest.areMapsOfMapsEqual(mapThree, mapOne) shouldBe false
    underTest.areMapsOfMapsEqual(mapOne, mapOne) shouldBe true
    underTest.areMapsOfMapsEqual(mapOne, mapTwo) shouldBe true
    underTest.areMapsOfMapsEqual(mapTwo, mapOne) shouldBe true
    underTest.areMapsOfMapsEqual(mapThree, mapThree) shouldBe true
  }

  "validateWorkflowData" should "return empty seq when workflows are different otherwise seq with error" in {
    // given
    val originalWorkflow = WorkflowFixture.createWorkflowJoined()
    val originalKafkaSensorProperties = originalWorkflow.sensor.properties.asInstanceOf[KafkaSensorProperties]
    val changeInDetails = originalWorkflow.copy(name = "differentName")
    val changeInSensor = originalWorkflow.copy(sensor =
      originalWorkflow.sensor.copy(properties =
        originalKafkaSensorProperties.copy(matchProperties = Map("diffKey" -> "diffValue"))
      )
    )
    val changeInJobs = originalWorkflow.copy(dagDefinitionJoined =
      originalWorkflow.dagDefinitionJoined.copy(jobDefinitions =
        Seq(
          originalWorkflow.dagDefinitionJoined.jobDefinitions.head,
          originalWorkflow.dagDefinitionJoined.jobDefinitions.last.copy(name = "differentName")
        )
      )
    )

    val underTest = new WorkflowValidationServiceImpl(workflowRepository, jobTemplateService)

    // then
    await(underTest.validateWorkflowData(originalWorkflow, originalWorkflow.copy())) shouldBe Seq(
      ValidationError("Nothing to update")
    )
    await(underTest.validateWorkflowData(originalWorkflow, changeInDetails)) shouldBe Seq.empty[ApiError]
    await(underTest.validateWorkflowData(originalWorkflow, changeInSensor)) shouldBe Seq.empty[ApiError]
    await(underTest.validateWorkflowData(originalWorkflow, changeInJobs)) shouldBe Seq.empty[ApiError]
  }
}
