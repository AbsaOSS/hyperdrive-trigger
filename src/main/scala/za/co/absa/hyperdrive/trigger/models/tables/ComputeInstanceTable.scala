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
import za.co.absa.hyperdrive.trigger.models.ComputeInstance
import za.co.absa.hyperdrive.trigger.models.enums.ComputeInstanceStatuses.ComputeInstanceStatus

trait ComputeInstanceTable {
  this: Profile with JdbcTypeMapper =>
  import profile.api._

  final class ComputeInstanceTable(tag: Tag) extends Table[ComputeInstance](tag, _tableName = "compute_instance") {

    def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))
    def status: Rep[ComputeInstanceStatus] = column[ComputeInstanceStatus]("status")
    def lastPing: Rep[LocalDateTime] = column[LocalDateTime]("last_ping")

    def * : ProvenShape[ComputeInstance] = (id, status, lastPing) <> (
      tuple =>
        ComputeInstance.apply(
          id = tuple._1,
          status = tuple._2,
          lastPing = tuple._3
        ),
      ComputeInstance.unapply
    )

  }

  lazy val computeInstanceTable = TableQuery[ComputeInstanceTable]

}
