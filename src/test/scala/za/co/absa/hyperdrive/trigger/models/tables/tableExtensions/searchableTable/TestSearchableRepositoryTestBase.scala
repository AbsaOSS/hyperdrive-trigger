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

package za.co.absa.hyperdrive.trigger.models.tables.tableExtensions.searchableTable

import za.co.absa.hyperdrive.trigger.persistance.RepositoryH2TestBase

import java.time.LocalDateTime

trait TestSearchableRepositoryTestBase extends RepositoryH2TestBase with TestSearchableTable {

  import api._

  def createSchema(): Unit = run(testSearchableTable.schema.create)

  def dropSchema(): Unit = run(testSearchableTable.schema.drop)

  def dropTable(): Unit = run(testSearchableTable.delete)

  def createFilterTestData(): Unit =
    run(testSearchableTable.forceInsertAll(TestSearchableData.testSearchableEntities))

  object TestSearchableData {
    val t1: TestSearchableEntity = TestSearchableEntity(
      longValue = 1,
      stringValue = "value1",
      stringValue2 = "str1",
      stringValue3 = "bar",
      localDateTimeValue = LocalDateTime.of(2020, 3, 1, 12, 30, 5),
      booleanValue = false
    )
    val t2: TestSearchableEntity = TestSearchableEntity(
      longValue = 2,
      stringValue = "value2",
      stringValue2 = "str2",
      stringValue3 = "bar",
      localDateTimeValue = LocalDateTime.of(2005, 3, 1, 12, 30, 5),
      booleanValue = true
    )
    val t3: TestSearchableEntity = TestSearchableEntity(
      longValue = 3,
      stringValue = "value3",
      stringValue2 = "str3",
      stringValue3 = "foo",
      localDateTimeValue = LocalDateTime.of(2025, 3, 1, 12, 30, 5),
      booleanValue = false
    )
    val testSearchableEntities: Seq[TestSearchableEntity] = Seq(t3, t2, t1)
  }

}
