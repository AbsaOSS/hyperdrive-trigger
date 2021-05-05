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
import za.co.absa.hyperdrive.trigger.models.{DagDefinition, Workflow}

trait DagDefinitionTable {
  this: Profile with WorkflowTable =>
  import  api._

  final class DagDefinitionTable(tag: Tag) extends Table[DagDefinition](tag, _tableName = "dag_definition") {

    def workflowId: Rep[Long] = column[Long]("workflow_id")
    def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))

    def workflow_fk: ForeignKeyQuery[WorkflowTable, Workflow] =
      foreignKey("dag_definition_workflow_fk", workflowId, TableQuery[WorkflowTable])(_.id)

    def * : ProvenShape[DagDefinition] = (workflowId, id) <> (
      dagDefinitionTuple =>
        DagDefinition.apply(
          workflowId = dagDefinitionTuple._1,
          id = dagDefinitionTuple._2
        ),
      DagDefinition.unapply
    )

  }

  lazy val dagDefinitionTable = TableQuery[DagDefinitionTable]

}
