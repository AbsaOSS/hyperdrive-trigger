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
import za.co.absa.hyperdrive.trigger.models.{History, JobTemplate, JobTemplateHistory}

import java.time.LocalDateTime

trait JobTemplateHistoryTable extends HistoryTableQuery {
  this: Profile with JdbcTypeMapper =>

  import api._

  final class JobTemplateHistoryTable(tag: Tag)
      extends Table[JobTemplateHistory](tag, _tableName = "job_template_history")
      with HistoryTable {
    override def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))
    override def changedOn: Rep[LocalDateTime] = column[LocalDateTime]("changed_on")
    override def changedBy: Rep[String] = column[String]("changed_by")
    override def operation: Rep[DBOperation] = column[DBOperation]("operation")
    override def entityId: Rep[Long] = column[Long]("job_template_id")
    def jobTemplate: Rep[JobTemplate] = column[JobTemplate]("job_template")

    def * : ProvenShape[JobTemplateHistory] = (id, changedOn, changedBy, operation, entityId, jobTemplate) <> (
      jobTemplateTuple =>
        JobTemplateHistory.apply(
          history = History.apply(
            id = jobTemplateTuple._1,
            changedOn = jobTemplateTuple._2,
            changedBy = jobTemplateTuple._3,
            operation = jobTemplateTuple._4
          ),
          jobTemplateId = jobTemplateTuple._5,
          jobTemplate = jobTemplateTuple._6
        ),
      (jobTemplateHistory: JobTemplateHistory) =>
        Option(
          (
            jobTemplateHistory.history.id,
            jobTemplateHistory.history.changedOn,
            jobTemplateHistory.history.changedBy,
            jobTemplateHistory.history.operation,
            jobTemplateHistory.jobTemplateId,
            jobTemplateHistory.jobTemplate
          )
        )
    )
  }

  lazy val jobTemplateHistoryTable = TableQuery[JobTemplateHistoryTable]

}
