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
import za.co.absa.hyperdrive.trigger.TestUtils
import za.co.absa.hyperdrive.trigger.models.errors.{ApiError, DatabaseError, ValidationError}
import za.co.absa.hyperdrive.trigger.models.{DagInstanceJoined, Project, Workflow, WorkflowJoined}
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, WorkflowRepository}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ExecutionContext, Future}

class WorkflowServiceTest extends AsyncFlatSpec with Matchers with MockitoSugar with BeforeAndAfter {
  private val workflowRepository = mock[WorkflowRepository]
  private val dagInstanceRepository = mock[DagInstanceRepository]
  private val workflowValidationService = mock[WorkflowValidationService]

  before {
    reset(workflowRepository)
    reset(dagInstanceRepository)
    reset(workflowValidationService)
  }

  "WorkflowService.createWorkflow" should "should create a workflow" in {
    // given
    val underTest = new WorkflowServiceImpl(workflowRepository, dagInstanceRepository, workflowValidationService)
    val workflowJoined = WorkflowFixture.createWorkflowJoined()
    when(workflowValidationService.validateOnInsert(eqTo(workflowJoined))(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(workflowRepository.insertWorkflow(eqTo(workflowJoined))(any[ExecutionContext])).thenReturn(Future{Right(workflowJoined.id)})
    when(workflowRepository.getWorkflow(eqTo(workflowJoined.id))(any[ExecutionContext])).thenReturn(Future{workflowJoined})

    // when
    val result = TestUtils.await(underTest.createWorkflow(workflowJoined))

    // then
    verify(workflowRepository).insertWorkflow(eqTo(workflowJoined))(any[ExecutionContext])
    result shouldBe Right(workflowJoined)
  }

  it should "should return with errors if validation failed and not attempt to insert to DB" in {
    // given
    val underTest = new WorkflowServiceImpl(workflowRepository, dagInstanceRepository, workflowValidationService)
    val workflowJoined = WorkflowFixture.createWorkflowJoined()
    val errors: Seq[ApiError] = Seq(ValidationError("error"))
    when(workflowValidationService.validateOnInsert(eqTo(workflowJoined))(any[ExecutionContext]))
      .thenReturn(Future{errors})

    // when
    val result = TestUtils.await(underTest.createWorkflow(workflowJoined))

    // then
    verify(workflowRepository, never()).insertWorkflow(any[WorkflowJoined])(any[ExecutionContext])
    verify(workflowRepository, never()).getWorkflow(any[Long])(any[ExecutionContext])
    result shouldBe Left(errors)
  }

  it should "should return with errors if DB insert failed" in {
    // given
    val underTest = new WorkflowServiceImpl(workflowRepository, dagInstanceRepository, workflowValidationService)
    val workflowJoined = WorkflowFixture.createWorkflowJoined()
    val error = DatabaseError("error")
    when(workflowValidationService.validateOnInsert(eqTo(workflowJoined))(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(workflowRepository.insertWorkflow(eqTo(workflowJoined))(any[ExecutionContext]))
      .thenReturn(Future{Left(error)})

    // when
    val result = TestUtils.await(underTest.createWorkflow(workflowJoined))

    // then
    verify(workflowRepository).insertWorkflow(eqTo(workflowJoined))(any[ExecutionContext])
    verify(workflowRepository, never()).getWorkflow(any[Long])(any[ExecutionContext])
    result shouldBe Left(Seq(error))
  }

  "WorkflowService.updateWorkflow" should "should update a workflow" in {
    // given
    val underTest = new WorkflowServiceImpl(workflowRepository, dagInstanceRepository, workflowValidationService)
    val workflowJoined = WorkflowFixture.createWorkflowJoined()
    when(workflowValidationService.validateOnUpdate(eqTo(workflowJoined))(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(workflowRepository.updateWorkflow(any[WorkflowJoined])(any[ExecutionContext])).thenReturn(Future{Right((): Unit)})
    when(workflowRepository.getWorkflow(eqTo(workflowJoined.id))(any[ExecutionContext])).thenReturn(Future{workflowJoined})
    when(workflowRepository.getWorkflow(eqTo(workflowJoined.id))(any[ExecutionContext])).thenReturn(Future{workflowJoined})

    // when
    val result = TestUtils.await(underTest.updateWorkflow(workflowJoined))

    // then
    verify(workflowRepository).updateWorkflow(any[WorkflowJoined])(any[ExecutionContext])
    result shouldBe Right(workflowJoined)
  }

  it should "should return with errors if validation failed and not attempt to update on DB" in {
    // given
    val underTest = new WorkflowServiceImpl(workflowRepository, dagInstanceRepository, workflowValidationService)
    val workflowJoined = WorkflowFixture.createWorkflowJoined()
    val errors: Seq[ApiError] = Seq(ValidationError("error"))
    when(workflowValidationService.validateOnUpdate(eqTo(workflowJoined))(any[ExecutionContext]))
      .thenReturn(Future{errors})
    when(workflowRepository.getWorkflow(eqTo(workflowJoined.id))(any[ExecutionContext])).thenReturn(Future{workflowJoined})

    // when
    val result = TestUtils.await(underTest.updateWorkflow(workflowJoined))

    // then
    verify(workflowRepository, never()).updateWorkflow(any[WorkflowJoined])(any[ExecutionContext])
    result shouldBe Left(errors)
  }

  it should "should return with errors if DB update failed" in {
    // given
    val underTest = new WorkflowServiceImpl(workflowRepository, dagInstanceRepository, workflowValidationService)
    val workflowJoined = WorkflowFixture.createWorkflowJoined()
    val error = DatabaseError("error")
    when(workflowValidationService.validateOnUpdate(eqTo(workflowJoined))(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(workflowRepository.getWorkflow(eqTo(workflowJoined.id))(any[ExecutionContext])).thenReturn(Future{workflowJoined})
    when(workflowRepository.updateWorkflow(any[WorkflowJoined])(any[ExecutionContext]))
      .thenReturn(Future{Left(error)})

    // when
    val result = TestUtils.await(underTest.updateWorkflow(workflowJoined))

    // then
    verify(workflowRepository).updateWorkflow(any[WorkflowJoined])(any[ExecutionContext])
    result shouldBe Left(Seq(error))
  }

  "WorkflowService.getProjects" should "should return no project on no workflows" in {
    // given
    when(workflowRepository.getWorkflows()(any[ExecutionContext])).thenReturn(Future{Seq()})
    val underTest = new WorkflowServiceImpl(workflowRepository, dagInstanceRepository, workflowValidationService)

    // when
    val result: Seq[Project] = TestUtils.await(underTest.getProjects())

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

    val underTest = new WorkflowServiceImpl(workflowRepository, dagInstanceRepository, workflowValidationService)

    // when
    val result: Seq[Project] = TestUtils.await(underTest.getProjects())

    // then
    verify(workflowRepository, times(1)).getWorkflows()
    result.length shouldBe 2
  }

  "WorkflowService.runWorkflowJobs" should "should insert joined dag instance when jobs ids exist in workflow" in {
    // given
    val underTest = new WorkflowServiceImpl(workflowRepository, dagInstanceRepository, workflowValidationService)

    val workflowJoined = WorkflowFixture.createWorkflowJoined().copy()
    val workflowId = workflowJoined.id
    val jobIds = workflowJoined.dagDefinitionJoined.jobDefinitions.map(_.id)

    when(workflowRepository.getWorkflow(eqTo(workflowId))(any[ExecutionContext])).thenReturn(Future{workflowJoined})
    when(dagInstanceRepository.insertJoinedDagInstance(any[DagInstanceJoined])(any[ExecutionContext])).thenReturn(Future{(): Unit})

    // when
    val result: Boolean = TestUtils.await(underTest.runWorkflowJobs(workflowId, jobIds))

    // then
    verify(workflowRepository, times(1)).getWorkflow(any[Long])(any[ExecutionContext])
    verify(dagInstanceRepository, times(1)).insertJoinedDagInstance(any[DagInstanceJoined])(any[ExecutionContext])
    result shouldBe true
  }

  "WorkflowService.runWorkflowJobs" should "should not insert joined dag instance when jobs ids does not exist in workflow" in {
    // given
    val underTest = new WorkflowServiceImpl(workflowRepository, dagInstanceRepository, workflowValidationService)

    val workflowJoined = WorkflowFixture.createWorkflowJoined().copy()
    val workflowId = workflowJoined.id
    val jobIds: Seq[Long] = Seq(9999, 8888)

    when(workflowRepository.getWorkflow(eqTo(workflowId))(any[ExecutionContext])).thenReturn(Future{workflowJoined})
    when(dagInstanceRepository.insertJoinedDagInstance(any[DagInstanceJoined])(any[ExecutionContext])).thenReturn(Future{(): Unit})

    // when
    val result: Boolean = TestUtils.await(underTest.runWorkflowJobs(workflowId, jobIds))

    // then
    verify(workflowRepository, times(1)).getWorkflow(any[Long])(any[ExecutionContext])
    verify(dagInstanceRepository, never).insertJoinedDagInstance(any[DagInstanceJoined])(any[ExecutionContext])
    result shouldBe false
  }


}
