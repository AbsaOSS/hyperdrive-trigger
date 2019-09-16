package za.co.absa.hyperdrive.trigger.scheduler.sensors.kafka

import za.co.absa.hyperdrive.trigger.models.Settings

case class KafkaSettings(
  topic: String,
  servers: Set[String]
)

object KafkaSettings {
  def apply(settings: Settings): KafkaSettings = {
    KafkaSettings(
      topic = settings.variables("topic"),
      servers = settings.maps("servers")
    )
  }
}
