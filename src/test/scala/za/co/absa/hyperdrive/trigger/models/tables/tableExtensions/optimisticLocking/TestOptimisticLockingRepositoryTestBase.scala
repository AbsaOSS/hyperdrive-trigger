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

import za.co.absa.hyperdrive.trigger.persistance.RepositoryH2TestBase

trait TestOptimisticLockingRepositoryTestBase extends RepositoryH2TestBase with TestOptimisticLockingTable {
  import api._

  def createSchema(): Unit = run(testOptimisticLockingTable.schema.create)

  def dropSchema(): Unit = run(testOptimisticLockingTable.schema.drop)

  def dropTable(): Unit = run(testOptimisticLockingTable.delete)

  def createOptimisticLockingTestData(): Unit = {
    run(testOptimisticLockingTable.forceInsertAll(TestOptimisticLockingData.testOptimisticLockingEntities))
  }

  object TestOptimisticLockingData {
    val t1 = TestOptimisticLockingEntity(id = 1, stringValue = "value1", version = 1)
    val t2 = TestOptimisticLockingEntity(id = 2, stringValue = "value2", version = 2)
    val testOptimisticLockingEntities: Seq[TestOptimisticLockingEntity] = Seq(t2, t1)
  }

}
