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