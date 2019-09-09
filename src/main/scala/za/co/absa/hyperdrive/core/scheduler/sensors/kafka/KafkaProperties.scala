package za.co.absa.hyperdrive.core.scheduler.sensors.kafka

import za.co.absa.hyperdrive.core.models.Properties

case class KafkaProperties(
  topic: String,
  servers: Set[String]
)

object KafkaProperties {
  def apply(properties: Properties): KafkaProperties = {
    KafkaProperties(
      topic = properties.variables("topic"),
      servers = properties.maps("servers")
    )
  }
}
