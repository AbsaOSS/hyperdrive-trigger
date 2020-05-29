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
import java.util.concurrent.TimeUnit

import org.mockito.ArgumentMatchers.{eq => eqTo, _}
import org.mockito.ArgumentCaptor
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers}
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes
import za.co.absa.hyperdrive.trigger.models.errors.{ApiError, DatabaseError, ValidationError}
import za.co.absa.hyperdrive.trigger.models.{Project, Properties, Sensor, Settings, Workflow, WorkflowJoined}
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, WorkflowRepository}
import za.co.absa.hyperdrive.trigger.scheduler.sensors.time.TimeSensorSettings

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContext, Future}

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
    val result = Await.result(underTest.createWorkflow(workflowJoined), Duration(120, TimeUnit.SECONDS))

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
    val result = Await.result(underTest.createWorkflow(workflowJoined), Duration(120, TimeUnit.SECONDS))

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
    val result = Await.result(underTest.createWorkflow(workflowJoined), Duration(120, TimeUnit.SECONDS))

    // then
    verify(workflowRepository).insertWorkflow(eqTo(workflowJoined))(any[ExecutionContext])
    verify(workflowRepository, never()).getWorkflow(any[Long])(any[ExecutionContext])
    result shouldBe Left(Seq(error))
  }

  it should "should generate a quartz job id for a time-based job" in {
    // given
    val underTest = new WorkflowServiceImpl(workflowRepository, dagInstanceRepository, workflowValidationService)
    val workflow = WorkflowFixture.createWorkflowJoined().copy(sensor = Sensor(
      sensorType = SensorTypes.Time,
      properties = Properties(
        settings = Settings(
          variables = Map(TimeSensorSettings.CRON_EXPRESSION_KEY -> "* * * * ? *"),
          maps = Map()
        ),
        matchProperties = Map()
      )
    ))

    val deliberateError = DatabaseError("deliberateError")
    when(workflowValidationService.validateOnInsert(any[WorkflowJoined])(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(workflowRepository.insertWorkflow(any[WorkflowJoined])(any[ExecutionContext])).thenReturn(Future{Left(deliberateError)})

    // when
    Await.result(underTest.createWorkflow(workflow), Duration(120, TimeUnit.SECONDS))

    // then
    val captor = ArgumentCaptor.forClass(classOf[WorkflowJoined])
    verify(workflowRepository).insertWorkflow(captor.capture())(any[ExecutionContext])
    val insertedWorkflow: WorkflowJoined = captor.getValue
    insertedWorkflow.sensor.properties.settings.variables should contain key TimeSensorSettings.QUARTZ_JOB_ID_KEY
    insertedWorkflow.sensor.properties.settings.variables(TimeSensorSettings.QUARTZ_JOB_ID_KEY) should not be empty
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
    val result = Await.result(underTest.updateWorkflow(workflowJoined), Duration(120, TimeUnit.SECONDS))

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
    val result = Await.result(underTest.updateWorkflow(workflowJoined), Duration(120, TimeUnit.SECONDS))

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
    val result = Await.result(underTest.updateWorkflow(workflowJoined), Duration(120, TimeUnit.SECONDS))

    // then
    verify(workflowRepository).updateWorkflow(any[WorkflowJoined])(any[ExecutionContext])
    result shouldBe Left(Seq(error))
  }

  it should "should generate a quartz job id for a time-based job" in {
    // given
    val underTest = new WorkflowServiceImpl(workflowRepository, dagInstanceRepository, workflowValidationService)
    val workflow = WorkflowFixture.createWorkflowJoined().copy(sensor = Sensor(
      sensorType = SensorTypes.Time,
      properties = Properties(
        settings = Settings(
          variables = Map(TimeSensorSettings.CRON_EXPRESSION_KEY -> "* * * * ? *"),
          maps = Map()
        ),
        matchProperties = Map()
      )
    ))

    val deliberateError = DatabaseError("deliberateError")
    when(workflowValidationService.validateOnUpdate(any[WorkflowJoined])(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(workflowRepository.getWorkflow(eqTo(workflow.id))(any[ExecutionContext])).thenReturn(Future{workflow})
    when(workflowRepository.updateWorkflow(any[WorkflowJoined])(any[ExecutionContext])).thenReturn(Future{Left(deliberateError)})

    // when
    Await.result(underTest.updateWorkflow(workflow), Duration(120, TimeUnit.SECONDS))

    // then
    val captor = ArgumentCaptor.forClass(classOf[WorkflowJoined])
    verify(workflowRepository).updateWorkflow(captor.capture())(any[ExecutionContext])
    val updatedWorkflow: WorkflowJoined = captor.getValue
    updatedWorkflow.sensor.properties.settings.variables should contain key TimeSensorSettings.QUARTZ_JOB_ID_KEY
    updatedWorkflow.sensor.properties.settings.variables(TimeSensorSettings.QUARTZ_JOB_ID_KEY) should not be empty
  }

  it should "should not modify the quartz job id if it already exists" in {
    // given
    val underTest = new WorkflowServiceImpl(workflowRepository, dagInstanceRepository, workflowValidationService)
    val uuid = UUID.randomUUID().toString
    val workflow = WorkflowFixture.createWorkflowJoined().copy(sensor = Sensor(
      sensorType = SensorTypes.Time,
      properties = Properties(
        settings = Settings(
          variables = Map(
            TimeSensorSettings.CRON_EXPRESSION_KEY -> "* * * * ? *",
            TimeSensorSettings.QUARTZ_JOB_ID_KEY -> uuid
          ),
          maps = Map()
        ),
        matchProperties = Map()
      )
    ))

    val deliberateError = DatabaseError("deliberateError")
    when(workflowValidationService.validateOnUpdate(any[WorkflowJoined])(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(workflowRepository.getWorkflow(eqTo(workflow.id))(any[ExecutionContext])).thenReturn(Future{workflow})
    when(workflowRepository.updateWorkflow(any[WorkflowJoined])(any[ExecutionContext])).thenReturn(Future{Left(deliberateError)})

    // when
    Await.result(underTest.updateWorkflow(workflow), Duration(120, TimeUnit.SECONDS))

    // then
    val captor = ArgumentCaptor.forClass(classOf[WorkflowJoined])
    verify(workflowRepository).updateWorkflow(captor.capture())(any[ExecutionContext])
    val updatedWorkflow: WorkflowJoined = captor.getValue
    updatedWorkflow.sensor.properties.settings.variables(TimeSensorSettings.QUARTZ_JOB_ID_KEY) shouldBe uuid
  }

  "WorkflowService.getProjects" should "should return no project on no workflows" in {
    // given
    when(workflowRepository.getWorkflows()(any[ExecutionContext])).thenReturn(Future{Seq()})
    val underTest = new WorkflowServiceImpl(workflowRepository, dagInstanceRepository, workflowValidationService)

    // when
    val result: Seq[Project] = Await.result(underTest.getProjects(), Duration(120, TimeUnit.SECONDS))

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
    val result: Seq[Project] = Await.result(underTest.getProjects(), Duration(120, TimeUnit.SECONDS))

    // then
    verify(workflowRepository, times(1)).getWorkflows()
    result.length shouldBe 2
  }

}
