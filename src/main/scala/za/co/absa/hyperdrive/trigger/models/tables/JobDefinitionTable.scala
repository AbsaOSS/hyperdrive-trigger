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

import slick.lifted.{ForeignKeyQuery, ProvenShape}
import za.co.absa.hyperdrive.trigger.models.{DagDefinition, JobDefinition, JobDefinitionParameters, JobTemplate}

trait JobDefinitionTable {
  this: Profile with JdbcTypeMapper with DagDefinitionTable with JobTemplateTable =>
  import api._

  final class JobDefinitionTable(tag: Tag) extends Table[JobDefinition](tag, _tableName = "job_definition") {

    def dagDefinitionId: Rep[Long] = column[Long]("dag_definition_id")
    def jobTemplateId: Rep[Long] = column[Long]("job_template_id")
    def name: Rep[String] = column[String]("name")
    def jobParameters: Rep[JobDefinitionParameters] = column[JobDefinitionParameters]("job_parameters", O.SqlType("JSONB"))
    def order: Rep[Int] = column[Int]("order")
    def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))

    def dagDefinition_fk: ForeignKeyQuery[DagDefinitionTable, DagDefinition] =
      foreignKey("job_definition_dag_definition_fk", dagDefinitionId, TableQuery[DagDefinitionTable])(_.id)

    def jobTemplate_fk: ForeignKeyQuery[JobTemplateTable, JobTemplate] =
      foreignKey("job_definition_job_template_fk", jobTemplateId, TableQuery[JobTemplateTable])(_.id)

    def * : ProvenShape[JobDefinition] = (dagDefinitionId, jobTemplateId, name, jobParameters,
      order, id) <> (
      jobDefinitionTuple =>
        JobDefinition.apply(
          dagDefinitionId = jobDefinitionTuple._1,
          jobTemplateId = jobDefinitionTuple._2,
          name = jobDefinitionTuple._3,
          jobParameters = jobDefinitionTuple._4,
          order = jobDefinitionTuple._5,
          id = jobDefinitionTuple._6
        ),
      (jobDefinition: JobDefinition) =>
        Option(
          jobDefinition.dagDefinitionId,
          jobDefinition.jobTemplateId,
          jobDefinition.name,
          jobDefinition.jobParameters,
          jobDefinition.order,
          jobDefinition.id
        )
    )

  }

  lazy val jobDefinitionTable = TableQuery[JobDefinitionTable]

}
