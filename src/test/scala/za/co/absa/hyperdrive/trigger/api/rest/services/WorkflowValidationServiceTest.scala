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

import java.util.concurrent.TimeUnit

import org.mockito.ArgumentMatchers.{eq => eqTo, _}
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers}
import za.co.absa.hyperdrive.trigger.models.errors.ValidationError
import za.co.absa.hyperdrive.trigger.persistance.WorkflowRepository

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContext, Future}

class WorkflowValidationServiceTest extends AsyncFlatSpec with Matchers with MockitoSugar with BeforeAndAfter {
  private val workflowRepository = mock[WorkflowRepository]

  before {
    reset(workflowRepository)
  }

  "validateOnInsert" should "return None if entity is valid" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository)
    val workflowJoined = WorkflowFixture.createWorkflowJoined()
    when(workflowRepository.existsWorkflow(eqTo(workflowJoined.name))(any[ExecutionContext])).thenReturn(Future{false})

    // when
    val result = Await.result(underTest.validateOnInsert(workflowJoined), Duration(120, TimeUnit.SECONDS))

    // then
    result shouldBe None
  }

  it should "fail if the workflow name already exists" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository)
    val workflow = WorkflowFixture.createWorkflowJoined()
    when(workflowRepository.existsWorkflow(eqTo(workflow.name))(any[ExecutionContext])).thenReturn(Future{true})

    // when
    val result = Await.result(underTest.validateOnInsert(workflow), Duration(120, TimeUnit.SECONDS))

    // then
    result.isDefined shouldBe true
    result.get should contain theSameElementsAs Set(ValidationError("Workflow name already exists"))
  }

  it should "fail if the project name is empty" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository)
    val workflow = WorkflowFixture.createWorkflowJoined()
    val invalidWorkflow = workflow.copy(project = "")
    when(workflowRepository.existsWorkflow(eqTo(invalidWorkflow.name))(any[ExecutionContext])).thenReturn(Future{false})

    // when
    val result = Await.result(underTest.validateOnInsert(invalidWorkflow), Duration(120, TimeUnit.SECONDS))

    // then
    result.isDefined shouldBe true
    result.get should contain theSameElementsAs Set(ValidationError("Project must not be empty"))
  }

  it should "fail if the project name is not defined" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository)
    val workflow = WorkflowFixture.createWorkflowJoined()
    val invalidWorkflow = workflow.copy(project = null)
    when(workflowRepository.existsWorkflow(eqTo(invalidWorkflow.name))(any[ExecutionContext])).thenReturn(Future{false})

    // when
    val result = Await.result(underTest.validateOnInsert(invalidWorkflow), Duration(120, TimeUnit.SECONDS))

    // then
    result.isDefined shouldBe true
    result.get should contain theSameElementsAs Set(ValidationError("Project must be set"))
  }

  "validateOnUpdate" should "return None if entity is valid" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository)
    val workflow = WorkflowFixture.createWorkflowJoined()
    when(workflowRepository.existsOtherWorkflow(eqTo(workflow.name), eqTo(workflow.id))(any[ExecutionContext])).thenReturn(Future{false})

    // when
    val result = Await.result(underTest.validateOnUpdate(workflow), Duration(120, TimeUnit.SECONDS))

    // then
    result shouldBe None
  }

  it should "fail if the workflow name already exists in another entity" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository)
    val workflow = WorkflowFixture.createWorkflowJoined()
    when(workflowRepository.existsOtherWorkflow(eqTo(workflow.name), eqTo(workflow.id))(any[ExecutionContext])).thenReturn(Future{true})

    // when
    val result = Await.result(underTest.validateOnUpdate(workflow), Duration(120, TimeUnit.SECONDS))

    // then
    result.isDefined shouldBe true
    result.get should contain theSameElementsAs Set(ValidationError("Workflow name already exists"))
  }

  it should "fail if the project name is empty" in {
    // given
    val underTest = new WorkflowValidationServiceImpl(workflowRepository)
    val workflow = WorkflowFixture.createWorkflowJoined()
    val invalidWorkflow = workflow.copy(project = "")
    when(workflowRepository.existsOtherWorkflow(eqTo(invalidWorkflow.name), eqTo(invalidWorkflow.id))(any[ExecutionContext])).thenReturn(Future{false})

    // when
    val result = Await.result(underTest.validateOnUpdate(invalidWorkflow), Duration(120, TimeUnit.SECONDS))

    // then
    result.isDefined shouldBe true
    result.get should contain theSameElementsAs Set(ValidationError("Project must not be empty"))
  }

}
