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

import slick.lifted.{ForeignKeyQuery, ProvenShape}
import za.co.absa.hyperdrive.trigger.models.{DagInstance, Workflow}
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses.DagInstanceStatus

trait DagInstanceTable {
  this: Profile with JdbcTypeMapper with WorkflowTable =>
  import  api._

  final class DagInstanceTable(tag: Tag) extends Table[DagInstance](tag, _tableName = "dag_instance") {

    def status: Rep[DagInstanceStatus] = column[DagInstanceStatus]("status")
    def triggeredBy: Rep[String] = column[String]("triggered_by")
    def workflowId: Rep[Long] = column[Long]("workflow_id")
    def started: Rep[LocalDateTime] = column[LocalDateTime]("started")
    def finished: Rep[Option[LocalDateTime]] = column[Option[LocalDateTime]]("finished")
    def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))

    def workflow_fk: ForeignKeyQuery[WorkflowTable, Workflow] =
      foreignKey("dag_instance_workflow_fk", workflowId, TableQuery[WorkflowTable])(_.id)

    def * : ProvenShape[DagInstance] = (status, triggeredBy, workflowId, started, finished, id) <> (
      dagInstanceTuple =>
        DagInstance.apply(
          status = dagInstanceTuple._1,
          triggeredBy = dagInstanceTuple._2,
          workflowId = dagInstanceTuple._3,
          started = dagInstanceTuple._4,
          finished = dagInstanceTuple._5,
          id = dagInstanceTuple._6
        ),
      DagInstance.unapply
    )
  }

  lazy val dagInstanceTable = TableQuery[DagInstanceTable]

}
