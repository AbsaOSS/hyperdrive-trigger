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
import za.co.absa.hyperdrive.trigger.models.{JobTemplate, JobTemplateParameters}

trait JobTemplateTable extends SearchableTableQuery {
  this: Profile with JdbcTypeMapper =>
  import api._

  final class JobTemplateTable(tag: Tag) extends Table[JobTemplate](tag, _tableName = "job_template") with SearchableTable {

    def name: Rep[String] = column[String]("name", O.Unique)
    def jobParameters: Rep[JobTemplateParameters] = column[JobTemplateParameters]("job_parameters", O.SqlType("JSONB"))
    def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))
    def formConfig: Rep[String] = column[String]("form_config")

    def * : ProvenShape[JobTemplate] = (name, jobParameters, id, formConfig) <> (
      jobTemplateTuple =>
        JobTemplate.apply(
          name = jobTemplateTuple._1,
          jobParameters = jobTemplateTuple._2,
          id = jobTemplateTuple._3,
          formConfig = jobTemplateTuple._4
        ),
      (jobTemplate: JobTemplate) =>
        Option(
          jobTemplate.name,
          jobTemplate.jobParameters,
          jobTemplate.id,
          jobTemplate.formConfig
        )
    )

    override def fieldMapping: Map[String, Rep[_]] = Map(
      "name" -> this.name,
      "id" -> this.id,
      "formConfig" -> this.formConfig
    )

    override def defaultSortColumn: Rep[_] = id
  }

  lazy val jobTemplateTable: TableQuery[JobTemplateTable] = TableQuery[JobTemplateTable]

}
