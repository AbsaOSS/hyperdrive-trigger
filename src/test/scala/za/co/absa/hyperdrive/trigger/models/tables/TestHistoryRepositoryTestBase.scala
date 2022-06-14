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

package za.co.absa.hyperdrive.trigger.models.tables

import za.co.absa.hyperdrive.trigger.models.enums.DBOperation
import za.co.absa.hyperdrive.trigger.persistance.RepositoryH2TestBase

import java.time.{LocalDate, LocalDateTime, LocalTime}

trait TestHistoryRepositoryTestBase extends RepositoryH2TestBase with TestHistoryTable {

  import api._

  def createSchema(): Unit = run(testHistoryTable.schema.create)

  def dropSchema(): Unit = run(testHistoryTable.schema.drop)

  def dropTable(): Unit = run(testHistoryTable.delete)

  def createHistoryTestData(): Unit =
    run(testHistoryTable.forceInsertAll(TestHistoryData.testHistoryEntities))

  object TestHistoryData {
    val t1 = TestHistoryEntity(
      id = 1L,
      changedOn = LocalDateTime.of(LocalDate.of(2020, 11, 24), LocalTime.of(15, 23, 24)),
      changedBy = "test-user",
      operation = DBOperation.Create,
      entityId = 42L
    )
    val t2 = TestHistoryEntity(
      id = 2L,
      changedOn = LocalDateTime.of(LocalDate.of(2020, 11, 24), LocalTime.of(16, 23, 24)),
      changedBy = "test-user",
      operation = DBOperation.Create,
      entityId = 52L
    )
    val t3 = TestHistoryEntity(
      id = 3L,
      changedOn = LocalDateTime.of(LocalDate.of(2020, 11, 24), LocalTime.of(17, 23, 24)),
      changedBy = "test-user",
      operation = DBOperation.Update,
      entityId = 42L
    )
    val testHistoryEntities: Seq[TestHistoryEntity] = Seq(t3, t2, t1)
  }

}
