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

import play.api.libs.json.JsValue
import za.co.absa.hyperdrive.trigger.models.{DagInstance, Event, Sensor, SensorProperties}
import slick.lifted.{ForeignKeyQuery, ProvenShape}

trait EventTable {
  this: Profile with JdbcTypeMapper with SensorTable with DagInstanceTable =>
  import api._

  final class EventTable(tag: Tag) extends Table[Event](tag, _tableName = "event") {

    def sensorEventId: Rep[String] = column[String]("sensor_event_id", O.Length(70), O.Unique)
    def sensorId: Rep[Long] = column[Long]("sensor_id")
    def payload: Rep[JsValue] = column[JsValue]("payload", O.SqlType("JSONB"))
    def dagInstanceId: Rep[Option[Long]] = column[Option[Long]]("dag_instance_id")
    def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))

    def sensor_fk: ForeignKeyQuery[SensorTable, Sensor[SensorProperties]] =
      foreignKey("event_sensor_fk", sensorId, TableQuery[SensorTable])(_.id)

    def dagInstance_fk: ForeignKeyQuery[DagInstanceTable, DagInstance] =
      foreignKey("event_dag_instance_fk", dagInstanceId, TableQuery[DagInstanceTable])(_.id)

    def * : ProvenShape[Event] = (sensorEventId, sensorId, payload, dagInstanceId, id) <> (
      eventTuple =>
        Event.apply(
          sensorEventId = eventTuple._1,
          sensorId = eventTuple._2,
          payload = eventTuple._3,
          dagInstanceId = eventTuple._4,
          id = eventTuple._5
        ),
      Event.unapply
    )

  }

  lazy val eventTable = TableQuery[EventTable]

}
