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

package za.co.absa.hyperdrive.trigger.models.tables.tableExtensions.optimisticLocking

import org.scalatest.{FlatSpec, _}

import scala.concurrent.ExecutionContext.Implicits.global

class OptimisticLockingTableQueryTest
    extends FlatSpec
    with Matchers
    with BeforeAndAfterAll
    with BeforeAndAfterEach
    with TestOptimisticLockingRepositoryTestBase {
  import api._

  behavior of "OptimisticLockingTableQuery"

  val underTest = testOptimisticLockingTable

  override def beforeAll: Unit =
    createSchema()

  override def afterAll: Unit =
    dropSchema()

  override def beforeEach: Unit =
    createOptimisticLockingTestData()

  override def afterEach: Unit =
    dropTable()

  it should "update entity if input version is the same as version in database" in {
    val updateRequest = TestOptimisticLockingData.t1.copy(stringValue = "changed")
    val id = updateRequest.id

    val result = await(db.run(underTest.filter(_.id === id).updateWithOptimisticLocking(updateRequest)))

    result shouldBe 1
  }

  it should "return error if input version is not the same as version in database" in {
    val initialVersion = TestOptimisticLockingData.t2.version - 1
    val updateRequest = TestOptimisticLockingData.t2.copy(stringValue = "changed", version = initialVersion)
    val id = TestOptimisticLockingData.t2.id

    val result =
      the[Exception] thrownBy await(db.run(underTest.filter(_.id === id).updateWithOptimisticLocking(updateRequest)))

    result shouldBe a[OptimisticLockingException]
  }
}
