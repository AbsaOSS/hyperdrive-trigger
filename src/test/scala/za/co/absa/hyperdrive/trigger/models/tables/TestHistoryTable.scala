
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

import slick.lifted.ProvenShape
import za.co.absa.hyperdrive.trigger.models.enums.DBOperation.DBOperation

import java.time.LocalDateTime


trait TestHistoryTable extends HistoryTableQuery {
  this: Profile with JdbcTypeMapper =>

  import api._

  case class TestHistoryEntity(
    id: Long,
    changedOn: LocalDateTime,
    changedBy: String,
    operation: DBOperation,
    entityId: Long
  )

  final class TestHistoryTable(tag: Tag) extends Table[TestHistoryEntity](tag, _tableName = "test_entity_history") with HistoryTable {
    override def id: Rep[Long] = column[Long]("id")
    override def changedOn: Rep[LocalDateTime] = column[LocalDateTime]("changed_on")
    override def changedBy: Rep[String] = column[String]("changed_by")
    override def operation: Rep[DBOperation] = column[DBOperation]("operation")
    override def entityId: Rep[Long] = column[Long]("entity_id")

    override def * : ProvenShape[TestHistoryEntity] = (id, changedOn, changedBy, operation, entityId).mapTo[TestHistoryEntity]
  }

  lazy val testHistoryTable = TableQuery[TestHistoryTable]

}
