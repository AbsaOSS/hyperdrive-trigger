package za.co.absa.hyperdrive.trigger.models

import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes.SensorType

case class Sensor(
  workflowId: Long,
  sensorType: SensorType,
  properties: Properties,
  id: Long = 0
)

case class Properties(
  sensorId: Long,
  settings: Settings,
  matchProperties: Map[String, String]
)

case class Settings(
  variables: Map[String, String],
  maps: Map[String, Set[String]]
)