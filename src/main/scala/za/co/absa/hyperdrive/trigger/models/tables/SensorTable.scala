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

import za.co.absa.hyperdrive.trigger.models.{Sensor, SensorProperties, Workflow}
import slick.lifted.{ForeignKeyQuery, ProvenShape}

trait SensorTable {
  this: Profile with JdbcTypeMapper with WorkflowTable =>
  import api._

  final class SensorTable(tag: Tag) extends Table[Sensor[SensorProperties]](tag, _tableName = "sensor") {

    def workflowId: Rep[Long] = column[Long]("workflow_id")
    def properties: Rep[SensorProperties] = column[SensorProperties]("properties", O.SqlType("JSONB"))
    def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))

    def workflow_fk: ForeignKeyQuery[WorkflowTable, Workflow] =
      foreignKey("sensor_workflow_fk", workflowId, TableQuery[WorkflowTable])(_.id)

    def * : ProvenShape[Sensor[SensorProperties]] = (workflowId, properties, id) <> (
      sensorTuple =>
        Sensor.apply(
          workflowId = sensorTuple._1,
          properties = sensorTuple._2,
          id = sensorTuple._3
        ),
      (sensor: Sensor[SensorProperties]) =>
        Option(
          sensor.workflowId,
          sensor.properties,
          sensor.id
        )
    )
  }

  lazy val sensorTable = TableQuery[SensorTable]

}
