/*
 * Copyright 2018-2019 ABSA Group Limited
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
import za.co.absa.hyperdrive.trigger.models.Workflow

trait WorkflowTable {
  this: Profile =>
  import  profile.api._

  final class WorkflowTable(tag: Tag) extends Table[Workflow](tag, _tableName = "workflow") {
    def name: Rep[String] = column[String]("name", O.Unique, O.Length(45))
    def isActive: Rep[Boolean] = column[Boolean]("is_active")
    def project: Rep[String] = column[String]("project")
    def created: Rep[LocalDateTime] = column[LocalDateTime]("created")
    def updated: Rep[Option[LocalDateTime]] = column[Option[LocalDateTime]]("updated")
    def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))

    def * : ProvenShape[Workflow] = (name, isActive, project, created, updated, id) <> (
      workflowTuple =>
        Workflow.apply(
          name = workflowTuple._1,
          isActive = workflowTuple._2,
          project = workflowTuple._3,
          created = workflowTuple._4,
          updated = workflowTuple._5,
          id = workflowTuple._6
        ),
      Workflow.unapply
    )
  }

  lazy val workflowTable = TableQuery[WorkflowTable]

}
