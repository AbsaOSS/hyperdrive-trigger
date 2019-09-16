package za.co.absa.hyperdrive.trigger.models.tables

import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes.SensorType
import za.co.absa.hyperdrive.trigger.models.{Properties, Sensor, Settings, Workflow}
import slick.lifted.{ForeignKeyQuery, ProvenShape}
import za.co.absa.hyperdrive.trigger.models.tables.JdbcTypeMapper._

final class SensorTable(tag: Tag) extends Table[Sensor](tag, _tableName = "sensor") {

  def workflowId: Rep[Long] = column[Long]("workflow_id")
  def sensorType: Rep[SensorType] = column[SensorType]("sensor_type")
  def variables: Rep[Map[String, String]] = column[Map[String, String]]("variables")
  def maps: Rep[Map[String, Set[String]]] = column[Map[String, Set[String]]]("maps")
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
