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

package za.co.absa.hyperdrive.trigger.persistance

import za.co.absa.hyperdrive.trigger.models.tables._
import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._

trait Repository {
  val db = Database.forConfig("db")

  val eventTable = TableQuery[EventTable]
  val sensorTable = TableQuery[SensorTable]
  val jobDefinitionTable = TableQuery[JobDefinitionTable]
  val jobInstanceTable = TableQuery[JobInstanceTable]
  val dagDefinitionTable = TableQuery[DagDefinitionTable]
  val dagInstanceTable = TableQuery[DagInstanceTable]
  val workflowTable = TableQuery[WorkflowTable]
}