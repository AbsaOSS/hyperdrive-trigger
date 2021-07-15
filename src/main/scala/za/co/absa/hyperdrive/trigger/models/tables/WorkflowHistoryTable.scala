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

import java.time.LocalDateTime

import slick.lifted.ProvenShape
import za.co.absa.hyperdrive.trigger.models.enums.DBOperation.DBOperation
import za.co.absa.hyperdrive.trigger.models.{History, WorkflowHistory, WorkflowJoined}

trait WorkflowHistoryTable extends HistoryTableQuery {
  this: Profile with JdbcTypeMapper =>

  import api._

  final class WorkflowHistoryTable(tag: Tag) extends Table[WorkflowHistory](tag, _tableName = "workflow_history") with HistoryTable {
    override def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))
    override def changedOn: Rep[LocalDateTime] = column[LocalDateTime]("changed_on")
    override def changedBy: Rep[String] = column[String]("changed_by")
    override def operation: Rep[DBOperation] = column[DBOperation]("operation")
    override def entityId: Rep[Long] = column[Long]("workflow_id")
    def workflow: Rep[WorkflowJoined] = column[WorkflowJoined]("workflow")

    def * : ProvenShape[WorkflowHistory] = (id, changedOn, changedBy, operation, entityId, workflow) <> (
      workflowTuple =>
        WorkflowHistory.apply(
          history = History.apply(
            id = workflowTuple._1,
            changedOn = workflowTuple._2,
            changedBy = workflowTuple._3,
            operation = workflowTuple._4
          ),
          workflowId = workflowTuple._5,
          workflow = workflowTuple._6
        ),
      (workflowHistory: WorkflowHistory) => Option(
        (
          workflowHistory.history.id,
          workflowHistory.history.changedOn,
          workflowHistory.history.changedBy,
          workflowHistory.history.operation,
          workflowHistory.workflowId,
          workflowHistory.workflow
        )
      )
    )
  }

  lazy val workflowHistoryTable = TableQuery[WorkflowHistoryTable]

}
