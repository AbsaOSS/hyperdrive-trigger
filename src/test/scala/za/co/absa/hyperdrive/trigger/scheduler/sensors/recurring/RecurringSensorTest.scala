
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

package za.co.absa.hyperdrive.trigger.scheduler.sensors.recurring

import java.util.concurrent

import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.{eq => eqTo, _}
import org.mockito.Mockito.{reset, never, times, verify, when}
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.persistance.DagInstanceRepository
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor

import scala.concurrent.{ExecutionContext, ExecutionContextExecutor, Future}

class RecurringSensorTest extends FlatSpec with MockitoSugar with Matchers with BeforeAndAfter {
  private implicit val executionContext: ExecutionContextExecutor =
    ExecutionContext.fromExecutor(concurrent.Executors.newSingleThreadExecutor())
  private val eventProcessor = mock[EventProcessor]
  private val dagInstanceRepository = mock[DagInstanceRepository]

  before {
    reset(eventProcessor)
    reset(dagInstanceRepository)
  }

  "RecurringSensor.poll" should "do nothing when workflow is running" in {
    // given
    val triggeredBy = "user"
    val properties = RecurringSensorProperties()
    val sensorDefinition = Sensor(-1L, properties)
    val sensorIds: SensorIds = SensorIds(sensorDefinition.id, sensorDefinition.workflowId)

    when(dagInstanceRepository.hasRunningDagInstance(eqTo(sensorDefinition.workflowId))(any[ExecutionContext])).thenReturn(Future{true})
    val underTest = new RecurringSensor(eventProcessor.eventProcessor(triggeredBy), sensorIds, properties, executionContext, dagInstanceRepository)

    // when
    val result: Unit = await(underTest.poll())

    // then
    result shouldBe (): Unit
    verify(eventProcessor, never()).eventProcessor(any[String])(any[Seq[Event]], any[Long])(any[ExecutionContext])
  }

  "RecurringSensor.poll" should "call event processor when workflow is not running" in {
    // given
    val triggeredBy = "user"
    val properties = RecurringSensorProperties()
    val sensorDefinition = Sensor(-1L, properties)
    val sensorIds: SensorIds = SensorIds(sensorDefinition.id, sensorDefinition.workflowId)

    when(dagInstanceRepository.hasRunningDagInstance(eqTo(sensorDefinition.workflowId))(any[ExecutionContext])).thenReturn(Future{false})
    when(eventProcessor.eventProcessor(eqTo(triggeredBy))(any[Seq[Event]], eqTo(sensorDefinition.id))(any[ExecutionContext])).thenReturn(Future{true})

    val underTest = new RecurringSensor(eventProcessor.eventProcessor(triggeredBy), sensorIds, properties, executionContext, dagInstanceRepository)

    // when
    val result: Unit = await(underTest.poll())

    // then
    result shouldBe (): Unit
    verify(eventProcessor, times(1)).eventProcessor(eqTo(triggeredBy))(any[Seq[Event]], any[Long])(any[ExecutionContext])
  }
}
