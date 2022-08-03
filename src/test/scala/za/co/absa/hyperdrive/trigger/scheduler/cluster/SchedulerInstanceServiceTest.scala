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

package za.co.absa.hyperdrive.trigger.scheduler.cluster

import java.time.{Duration, LocalDateTime}

import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.{any, eq => eqTo}
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers}
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.enums.SchedulerInstanceStatuses
import za.co.absa.hyperdrive.trigger.persistance.SchedulerInstanceRepository

import scala.concurrent.{ExecutionContext, Future}

class SchedulerInstanceServiceTest extends AsyncFlatSpec with MockitoSugar with Matchers with BeforeAndAfter {
  override implicit def executionContext: ExecutionContext = scala.concurrent.ExecutionContext.Implicits.global

  private val schedulerInstanceRepository = mock[SchedulerInstanceRepository]
  private val underTest = new SchedulerInstanceServiceImpl(schedulerInstanceRepository)

  before {
    reset(schedulerInstanceRepository)
  }

  "SchedulerInstanceService.registerNewInstance" should "insert a new instance" in {
    // given
    when(schedulerInstanceRepository.insertInstance()).thenReturn(Future {
      42L
    })

    // when
    val result = await(underTest.registerNewInstance())

    // then
    result shouldBe 42L
    verify(schedulerInstanceRepository, times(1)).insertInstance()
    succeed
  }

  "SchedulerInstanceService.updateSchedulerStatus" should "update the scheduler status" in {
    // given
    val lagThreshold = Duration.ofSeconds(5L)
    val instances = Seq(
      SchedulerInstance(23, SchedulerInstanceStatuses.Active, LocalDateTime.now()),
      SchedulerInstance(24, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    )
    when(schedulerInstanceRepository.getCurrentDateTime()(any[ExecutionContext]))
      .thenReturn(Future(LocalDateTime.now()))
    when(schedulerInstanceRepository.updateHeartbeat(any(), any())(any[ExecutionContext])).thenReturn(Future(1))
    when(schedulerInstanceRepository.getAllInstances()(any[ExecutionContext])).thenReturn(Future(instances))
    when(schedulerInstanceRepository.deactivateLaggingInstances(any(), any(), any())(any[ExecutionContext]))
      .thenReturn(Future(0))

    // when
    val result = await(underTest.updateSchedulerStatus(23L, lagThreshold))

    // then
    result shouldBe instances
    verify(schedulerInstanceRepository, times(1)).updateHeartbeat(eqTo(23L), any())(any())
    verify(schedulerInstanceRepository, times(1)).deactivateLaggingInstances(eqTo(23L), any(), eqTo(lagThreshold))(
      any()
    )
    succeed
  }

  it should "throw an exception if the heartbeat could not be updated" in {
    // given
    val lagThreshold = Duration.ofSeconds(5L)
    when(schedulerInstanceRepository.getCurrentDateTime()(any[ExecutionContext]))
      .thenReturn(Future(LocalDateTime.now()))
    when(schedulerInstanceRepository.updateHeartbeat(any(), any())(any[ExecutionContext])).thenReturn(Future(0))

    // when
    the[SchedulerInstanceAlreadyDeactivatedException] thrownBy await(underTest.updateSchedulerStatus(23L, lagThreshold))

    // then
    verify(schedulerInstanceRepository, never).deactivateLaggingInstances(any(), any(), any())(any())
    verify(schedulerInstanceRepository, never).getAllInstances()(any())
    succeed
  }
}
