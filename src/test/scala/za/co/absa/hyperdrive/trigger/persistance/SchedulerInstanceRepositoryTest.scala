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

package za.co.absa.hyperdrive.trigger.persistance

import java.time.{Duration, LocalDateTime}

import org.scalatest.{FlatSpec, _}
import za.co.absa.hyperdrive.trigger.models.SchedulerInstance
import za.co.absa.hyperdrive.trigger.models.enums.SchedulerInstanceStatuses

import scala.concurrent.ExecutionContext.Implicits.global

class SchedulerInstanceRepositoryTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with RepositoryTestBase {
  import profile.api._

  val schedulerInstanceRepository: SchedulerInstanceRepository = new SchedulerInstanceRepositoryImpl { override val profile = h2Profile }

  val schedulerInstances = Seq(
    SchedulerInstance(11L, SchedulerInstanceStatuses.Active, LocalDateTime.of(2020, 1, 1, 2, 30, 28)),
    SchedulerInstance(12L, SchedulerInstanceStatuses.Active, LocalDateTime.of(2020, 1, 1, 2, 30, 31)),
    SchedulerInstance(13L, SchedulerInstanceStatuses.Active, LocalDateTime.of(2020, 1, 1, 2, 30, 25)),
    SchedulerInstance(21L, SchedulerInstanceStatuses.Active, LocalDateTime.of(2020, 1, 1, 2, 30, 5)),
    SchedulerInstance(22L, SchedulerInstanceStatuses.Active, LocalDateTime.of(2020, 1, 1, 2, 29, 55)),
    SchedulerInstance(31L, SchedulerInstanceStatuses.Deactivated, LocalDateTime.of(2020, 1, 1, 2, 29, 15))
  )

  override def beforeAll: Unit = {
    h2SchemaSetup()
  }

  override def afterAll: Unit = {
    h2SchemaDrop()
  }

  override def beforeEach: Unit = {
    insertSchedulerInstances()
  }

  override def afterEach: Unit = {
    clearData()
  }

  "insertInstance" should "insert an instance in active state" in {
    val now = LocalDateTime.now()
    val expectedId = schedulerInstances.map(_.id).max + 1

    val newInstanceId = await(schedulerInstanceRepository.insertInstance())
    val allInstances = await(db.run(schedulerInstanceTable.result))

    newInstanceId shouldBe expectedId
    val newInstance = allInstances.find(_.id == expectedId).get
    newInstance.status shouldBe SchedulerInstanceStatuses.Active
    newInstance.lastPing.isBefore(now) shouldBe false

    allInstances should have size schedulerInstances.size + 1
    allInstances should contain allElementsOf schedulerInstances
  }

  "updatePing" should "update the last ping of an active instance" in {
    val now = LocalDateTime.now()
    val result = await(schedulerInstanceRepository.updatePing(11))
    val updatedInstance = await(db.run(schedulerInstanceTable.filter(_.id === 11L).result.head))

    result shouldBe 1
    updatedInstance.lastPing.isBefore(now) shouldBe false
  }

  it should "not update a deactivated instance" in {
    val result = await(schedulerInstanceRepository.updatePing(31L))
    result shouldBe 0
  }

  "deactivateLaggingInstances" should "deactivate lagging instances" in {
    val localTime = LocalDateTime.of(2020, 1, 1, 2, 30, 28)
    val lagTolerance = Duration.ofSeconds(20L)

    val result = await(schedulerInstanceRepository.deactivateLaggingInstances(localTime, lagTolerance))
    val allInstances = await(db.run(schedulerInstanceTable.result))

    result shouldBe 2
    allInstances
      .filter(_.status == SchedulerInstanceStatuses.Deactivated)
      .map(_.id) should contain theSameElementsAs Seq(21L, 22L, 31L)
  }

  "getDeactivatedInstances" should "return deactivated instances" in {
    val result = await(schedulerInstanceRepository.getDeactivatedInstances())
    result should contain theSameElementsAs schedulerInstances.filter(_.status == SchedulerInstanceStatuses.Deactivated)
  }

  "getActiveInstances" should "return active instances" in {
    val result = await(schedulerInstanceRepository.getActiveInstances())
    result should contain theSameElementsAs schedulerInstances.filter(_.status == SchedulerInstanceStatuses.Active)
  }

  def insertSchedulerInstances(): Unit = {
    run(schedulerInstanceTable.forceInsertAll(schedulerInstances))
  }
}
