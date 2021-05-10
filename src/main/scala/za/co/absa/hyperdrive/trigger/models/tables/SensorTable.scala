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

import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes.SensorType
import za.co.absa.hyperdrive.trigger.models.{Properties, Sensor, Settings, Workflow}
import slick.lifted.{ForeignKeyQuery, ProvenShape}

trait SensorTable {
  this: Profile with JdbcTypeMapper with WorkflowTable =>
  import api._

  final class SensorTable(tag: Tag) extends Table[Sensor](tag, _tableName = "sensor") {

    def workflowId: Rep[Long] = column[Long]("workflow_id")
    def sensorType: Rep[SensorType] = column[SensorType]("sensor_type")
    def variables: Rep[Map[String, String]] = column[Map[String, String]]("variables")
    def maps: Rep[Map[String, List[String]]] = column[Map[String, List[String]]]("maps")
    def matchProperties: Rep[Map[String, String]] = column[Map[String, String]]("match_properties")
    def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))

    def workflow_fk: ForeignKeyQuery[WorkflowTable, Workflow] =
      foreignKey("sensor_workflow_fk", workflowId, TableQuery[WorkflowTable])(_.id)

    def * : ProvenShape[Sensor] = (workflowId, sensorType, variables, maps, matchProperties, id) <> (
      sensorTuple =>
        Sensor.apply(
          workflowId = sensorTuple._1,
          sensorType = sensorTuple._2,
          properties = Properties.apply(
            sensorId = sensorTuple._6,
            settings = Settings.apply(
              variables = sensorTuple._3,
              maps = sensorTuple._4
            ),
            matchProperties = sensorTuple._5
          ),
          id = sensorTuple._6
        ),
      (sensor: Sensor) =>
        Option(
          sensor.workflowId,
          sensor.sensorType,
          sensor.properties.settings.variables,
          sensor.properties.settings.maps,
          sensor.properties.matchProperties,
          sensor.id
        )
    )
  }

  lazy val sensorTable = TableQuery[SensorTable]

}
