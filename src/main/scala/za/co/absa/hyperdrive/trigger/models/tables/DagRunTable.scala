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

import slick.jdbc.JdbcProfile
import slick.lifted.ProvenShape
import za.co.absa.hyperdrive.trigger.models.dagRuns.DagRun

trait DagRunTable extends SearchableTableQuery {
  this: Profile with JdbcTypeMapper =>
  import api._

  final class DagRunTable(tag: Tag) extends Table[DagRun](tag, _tableName = "dag_run_view") with SearchableTable {
    def workflowId: Rep[Long] = column[Long]("workflow_id")
    def workflowName: Rep[String] = column[String]("workflow_name")
    def projectName: Rep[String] = column[String]("project_name")
    def jobCount: Rep[Int] = column[Int]("job_count")
    def started: Rep[LocalDateTime] = column[LocalDateTime]("started")
    def finished: Rep[Option[LocalDateTime]] = column[Option[LocalDateTime]]("finished")
    def status: Rep[String] = column[String]("status")
    def triggeredBy: Rep[String] = column[String]("triggered_by")
    def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))
    override def * : ProvenShape[DagRun] = (workflowId, workflowName, projectName, jobCount, started, finished, status, triggeredBy, id).mapTo[DagRun]

    override def fieldMapping: Map[String, Rep[_]] = Map(
      "workflowId" -> this.workflowId,
      "workflowName" -> this.workflowName,
      "projectName" -> this.projectName,
      "jobCount" -> this.jobCount,
      "started" -> this.started,
      "finished" -> this.finished,
      "status" -> this.status,
      "triggeredBy" -> this.triggeredBy,
      "id" -> this.id
    )

    override def defaultSortColumn: Rep[_] = id

  }

  lazy val dagRunTable: TableQuery[DagRunTable] = TableQuery[DagRunTable]
}
