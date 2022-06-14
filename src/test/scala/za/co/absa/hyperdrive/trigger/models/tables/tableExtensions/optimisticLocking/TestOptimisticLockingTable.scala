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

import slick.lifted.ProvenShape
import za.co.absa.hyperdrive.trigger.models.tables.{JdbcTypeMapper, Profile}

trait TestOptimisticLockingTable extends OptimisticLockingTableQuery {
  this: Profile with JdbcTypeMapper =>

  import api._

  case class TestOptimisticLockingEntity(id: Long, stringValue: String, override val version: Long)
      extends OptimisticLockingEntity[TestOptimisticLockingEntity] {
    override def updateVersion(newVersion: Long): TestOptimisticLockingEntity = copy(version = newVersion)
  }

  final class TestOptimisticLockingTable(tag: Tag)
      extends Table[TestOptimisticLockingEntity](tag, _tableName = "test_optimistic_locking_entity")
      with OptimisticLockingTable {
    def id: Rep[Long] = column[Long]("id")
    def stringField: Rep[String] = column[String]("string_field")
    def version: Rep[Long] = column[Long]("version")

    override def * : ProvenShape[TestOptimisticLockingEntity] =
      (id, stringField, version).mapTo[TestOptimisticLockingEntity]
  }

  lazy val testOptimisticLockingTable = TableQuery[TestOptimisticLockingTable]

}
