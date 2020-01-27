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

import za.co.absa.hyperdrive.trigger.models.{DagDefinition, JobDefinition, JobParameters}
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType
import slick.lifted.{ForeignKeyQuery, ProvenShape}

trait JobDefinitionTable {
  this: Profile with JdbcTypeMapper with DagDefinitionTable =>
  import  profile.api._

  final class JobDefinitionTable(tag: Tag) extends Table[JobDefinition](tag, _tableName = "job_definition") {

    def dagDefinitionId: Rep[Long] = column[Long]("dag_definition_id")
    def name: Rep[String] = column[String]("name")
    def jobType: Rep[JobType] = column[JobType]("job_type")
    def variables: Rep[Map[String, String]] = column[Map[String, String]]("variables")
    def maps: Rep[Map[String, Set[String]]] = column[Map[String, Set[String]]]("maps")
    def order: Rep[Int] = column[Int]("order")
    def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))

    def dagDefinition_fk: ForeignKeyQuery[DagDefinitionTable, DagDefinition] =
      foreignKey("job_definition_dag_definition_fk", dagDefinitionId, TableQuery[DagDefinitionTable])(_.id)

    def * : ProvenShape[JobDefinition] = (dagDefinitionId, name, jobType, variables, maps, order, id) <> (
      jobDefinitionTuple =>
        JobDefinition.apply(
          dagDefinitionId = jobDefinitionTuple._1,
          name = jobDefinitionTuple._2,
          jobType = jobDefinitionTuple._3,
          jobParameters = JobParameters(
            variables = jobDefinitionTuple._4,
            maps = jobDefinitionTuple._5
          ),
          order = jobDefinitionTuple._6,
          id = jobDefinitionTuple._7
        ),
      (jobDefinition: JobDefinition) =>
        Option(
          jobDefinition.dagDefinitionId,
          jobDefinition.name,
          jobDefinition.jobType,
          jobDefinition.jobParameters.variables,
          jobDefinition.jobParameters.maps,
          jobDefinition.order,
          jobDefinition.id
        )
    )

  }

  lazy val jobDefinitionTable = TableQuery[JobDefinitionTable]

}
