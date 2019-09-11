package za.co.absa.hyperdrive.trigger.models.enums

object SensorTypes {

  sealed abstract class SensorType(val name: String) {
    override def toString: String = name
  }

  case object Kafka extends SensorType("Kafka")
  case object AbsaKafka extends SensorType("Absa-Kafka")

  val sensorTypes: Set[SensorType] = Set(Kafka, AbsaKafka)

}