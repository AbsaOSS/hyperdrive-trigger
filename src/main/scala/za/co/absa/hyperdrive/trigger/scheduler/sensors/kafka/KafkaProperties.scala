package za.co.absa.hyperdrive.trigger.scheduler.sensors.kafka

import za.co.absa.hyperdrive.trigger.models.Properties

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
