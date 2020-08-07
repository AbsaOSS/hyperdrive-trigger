
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

package za.co.absa.hyperdrive.trigger.scheduler

import java.time.LocalDateTime

import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.{any, eq => eqTo}
import org.mockito.Mockito.{never, reset, verify, when}
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
import play.api.libs.json.JsObject
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.api.rest.services.JobTemplateService
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.enums.{DagInstanceStatuses, JobTypes}
import za.co.absa.hyperdrive.trigger.persistance.{DagDefinitionRepository, DagInstanceRepository, EventRepository}
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ExecutionContext, Future}

class EventProcessorTest extends FlatSpec with MockitoSugar with Matchers with BeforeAndAfter {
  private val eventRepository = mock[EventRepository]
  private val dagDefinitionRepository = mock[DagDefinitionRepository]
  private val dagInstanceRepository = mock[DagInstanceRepository]
  private val jobTemplateService = mock[JobTemplateService]
  private val underTest = new EventProcessor(eventRepository, dagDefinitionRepository, dagInstanceRepository, jobTemplateService)

  before {
    reset(eventRepository)
    reset(dagDefinitionRepository)
    reset(dagInstanceRepository)
    reset(jobTemplateService)
  }

  "EventProcessor.eventProcessor" should "persist a dag instances for each event" in {
    // given
    val sensorId = 1L
    val workflowId = 10L
    val dagDefinitionId = 100L
    val event = createEvent(sensorId)
    val jobDefinition = createJobDefintion(dagDefinitionId)
    val dagDefinition = createDagDefinition(workflowId, dagDefinitionId, Seq(jobDefinition))

    val dagInstanceJoined = createDagInstanceJoined()
    when(eventRepository.getExistEvents(any())(any[ExecutionContext])).thenReturn(Future{Seq()})
    when(dagDefinitionRepository.getJoinedDagDefinition(eqTo(sensorId))(any[ExecutionContext])).thenReturn(Future{Some(dagDefinition)})
    when(jobTemplateService.resolveJobTemplate(any[DagDefinitionJoined])(any[ExecutionContext])).thenReturn(Future{dagInstanceJoined})
    when(dagInstanceRepository.insertJoinedDagInstances(any())(any[ExecutionContext])).thenReturn(Future{(): Unit})

    // when
    await(underTest.eventProcessor(Seq(event), Properties(sensorId, Settings(Map.empty, Map.empty), Map.empty)))

    // then
    val dagInstanceCaptor = ArgumentCaptor.forClass(classOf[Seq[(DagInstanceJoined, Event)]])
    verify(dagInstanceRepository).insertJoinedDagInstances(dagInstanceCaptor.capture())(any[ExecutionContext])

    val insertedDagInstances: Seq[(DagInstanceJoined, Event)] = dagInstanceCaptor.getValue
    insertedDagInstances should have size 1

    val insertedDagInstanceJoined = insertedDagInstances.head._1
    insertedDagInstanceJoined.id shouldBe 3

    val insertedEvent = insertedDagInstances.head._2
    insertedEvent.sensorEventId shouldBe "sensorEventId"
    insertedEvent.sensorId shouldBe sensorId
  }

  "EventProcessor.eventProcessor" should "not persist a dag instance if the event already exists in DB" in {
    // given
    val sensorId = 1L
    val event = createEvent(sensorId)

    when(eventRepository.getExistEvents(any())(any[ExecutionContext])).thenReturn(Future{Seq(event.sensorEventId)})

    // when
    await(underTest.eventProcessor(Seq(event), Properties(sensorId, Settings(Map.empty, Map.empty), Map.empty)))

    // then
    verify(dagDefinitionRepository, never()).getJoinedDagDefinition(any())(any[ExecutionContext])
    verify(jobTemplateService, never).resolveJobTemplate(any[DagDefinitionJoined])(any[ExecutionContext])
    verify(dagInstanceRepository, never()).insertJoinedDagInstances(any())(any[ExecutionContext])
  }

  "EventProcessor.eventProcessor" should "not persist a dag instance if there is no dag definition for event" in {
    // given
    val sensorId = 1L
    val event = createEvent(sensorId)

    when(eventRepository.getExistEvents(any())(any[ExecutionContext])).thenReturn(Future{Seq()})
    when(dagDefinitionRepository.getJoinedDagDefinition(eqTo(sensorId))(any[ExecutionContext])).thenReturn(Future{None})

    // when
    await(underTest.eventProcessor(Seq(event), Properties(sensorId, Settings(Map.empty, Map.empty), Map.empty)))
    // then
    verify(dagDefinitionRepository).getJoinedDagDefinition(eqTo(sensorId))(any[ExecutionContext])
    verify(jobTemplateService, never).resolveJobTemplate(any[DagDefinitionJoined])(any[ExecutionContext])
    verify(dagInstanceRepository, never()).insertJoinedDagInstances(any())(any[ExecutionContext])
  }

  private def createEvent(sensorId: Long) = {
    val properties = Properties(sensorId, Settings(Map.empty, Map.empty), Map.empty)
    Event("sensorEventId", properties.sensorId, JsObject.empty)
  }

  private def createJobDefintion(dagDefinitionId: Long): JobDefinition = {
    JobDefinition(dagDefinitionId, -1L, "someJobName", JobParameters(Map.empty, Map.empty), 1)
  }

  private def createDagDefinition(workflowId: Long, id: Long, jobDefinitions: Seq[JobDefinition]) = DagDefinitionJoined(workflowId, jobDefinitions, id)

  private def createDagInstanceJoined() = {
    DagInstanceJoined(
      status = DagInstanceStatuses.InQueue,
      workflowId = 2,
      jobInstances = Seq(),
      started = LocalDateTime.now(),
      finished = None,
      id = 3
    )
  }

}
