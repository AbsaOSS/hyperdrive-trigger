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

class SchedulerInstanceRepositoryTest
    extends FlatSpec
    with Matchers
    with BeforeAndAfterAll
    with BeforeAndAfterEach
    with RepositoryH2TestBase {
  import api._

  val schedulerInstanceRepository: SchedulerInstanceRepository =
    new SchedulerInstanceRepositoryImpl(dbProvider) { override val profile = h2Profile }

  override def beforeAll: Unit =
    schemaSetup()

  override def afterAll: Unit =
    schemaDrop()

  override def beforeEach: Unit =
    run(schedulerInstanceTable.forceInsertAll(TestData.schedulerInstances))

  override def afterEach: Unit =
    clearData()

  "insertInstance" should "insert an instance in active state" in {
    val now = LocalDateTime.now()

    val newInstanceId = await(schedulerInstanceRepository.insertInstance())
    val allInstances = await(db.run(schedulerInstanceTable.result))

    val newInstance = allInstances.find(_.id == newInstanceId).get
    newInstance.status shouldBe SchedulerInstanceStatuses.Active
    newInstance.lastHeartbeat.isBefore(now) shouldBe false

    allInstances should have size TestData.schedulerInstances.size + 1
    allInstances should contain allElementsOf TestData.schedulerInstances
  }

  "updateHeartbeat" should "update the last heartbeat of an active instance" in {
    val newHeartbeat = LocalDateTime.now()
    val result = await(schedulerInstanceRepository.updateHeartbeat(11, newHeartbeat))
    val updatedInstance = await(db.run(schedulerInstanceTable.filter(_.id === 11L).result.head))

    result shouldBe 1
    updatedInstance.lastHeartbeat shouldBe newHeartbeat
  }

  it should "not update a deactivated instance" in {
    val newHeartbeat = LocalDateTime.now()
    val result = await(schedulerInstanceRepository.updateHeartbeat(31L, newHeartbeat))
    result shouldBe 0
  }

  "deactivateLaggingInstances" should "deactivate lagging instances, except own instance" in {
    val localTime = LocalDateTime.of(2020, 1, 1, 2, 30, 28)
    val lagTolerance = Duration.ofSeconds(20L)

    val result = await(schedulerInstanceRepository.deactivateLaggingInstances(21L, localTime, lagTolerance))
    val allInstances = await(db.run(schedulerInstanceTable.result))

    result shouldBe 1
    allInstances
      .filter(_.status == SchedulerInstanceStatuses.Deactivated)
      .map(_.id) should contain theSameElementsAs Seq(22L, 31L)
  }

  "getAllInstances" should "return all instances" in {
    val result = await(schedulerInstanceRepository.getAllInstances())
    result should contain theSameElementsAs TestData.schedulerInstances
  }

  "getCurrentDateTime" should "return database current date time" in {
    val result = await(schedulerInstanceRepository.getCurrentDateTime())
    val expected = LocalDateTime.now()
    result.getYear shouldBe expected.getYear
    result.getMonth shouldBe expected.getMonth
    result.getDayOfWeek shouldBe expected.getDayOfWeek
    result.getHour shouldBe expected.getHour
    result.getMinute shouldBe expected.getMinute
  }
}
