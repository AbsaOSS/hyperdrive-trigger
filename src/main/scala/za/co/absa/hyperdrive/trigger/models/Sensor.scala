package za.co.absa.hyperdrive.trigger.models

import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes.SensorType

case class Sensor(
  workflowId: Long,
  sensorType: SensorType,
  sensorProperties: SensorProperties,
  id: Long = 0
)

case class SensorProperties(
  sensorId: Long,
  properties: Properties,
  matchProperties: Map[String, String]
)

case class Properties(
  variables: Map[String, String],
  maps: Map[String, Set[String]]
)