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

package za.co.absa.hyperdrive.trigger.models

import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes.SensorType
import play.api.libs.json.{Format, JsResult, JsValue, Json, OFormat}

sealed trait SensorProperties {
  val sensorType: SensorType
}

case class KafkaSensorProperties(
  sensorType: SensorType = SensorTypes.Kafka,
  topic: String,
  servers: List[String] = List.empty[String],
  matchProperties: Map[String, String] = Map.empty[String, String]
) extends SensorProperties

case class AbsaKafkaSensorProperties(
  sensorType: SensorType = SensorTypes.AbsaKafka,
  topic: String,
  servers: List[String] = List.empty[String],
  ingestionToken: String
) extends SensorProperties {
  def toKafkaSensorProperties: KafkaSensorProperties = {
    KafkaSensorProperties(
      topic = topic,
      servers = servers,
      matchProperties = Map("ingestionToken" -> ingestionToken)
    )
  }
}

case class RecurringSensorProperties(
  sensorType: SensorType = SensorTypes.Recurring
) extends SensorProperties

case class TimeSensorProperties(
  sensorType: SensorType = SensorTypes.Time,
  cronExpression: String
) extends SensorProperties

object KafkaSensorProperties {
  implicit val kafkaFormat: OFormat[KafkaSensorProperties] = Json.using[Json.WithDefaultValues].format[KafkaSensorProperties]
}

object AbsaKafkaSensorProperties {
  implicit val absaKafkaFormat: OFormat[AbsaKafkaSensorProperties] = Json.using[Json.WithDefaultValues].format[AbsaKafkaSensorProperties]
}

object RecurringSensorProperties {
  implicit val recurringFormat: OFormat[RecurringSensorProperties] = Json.using[Json.WithDefaultValues].format[RecurringSensorProperties]
}

object TimeSensorProperties {
  implicit val timeFormat: OFormat[TimeSensorProperties] = Json.using[Json.WithDefaultValues].format[TimeSensorProperties]
}

object SensorProperties {
  implicit val sensorPropertiesFormat: Format[SensorProperties] = new Format[SensorProperties] {
    override def reads(json: JsValue): JsResult[SensorProperties] = {
      (json \ "sensorType").as[String] match {
        case SensorTypes.Kafka.name => KafkaSensorProperties.kafkaFormat.reads(json)
        case SensorTypes.AbsaKafka.name => AbsaKafkaSensorProperties.absaKafkaFormat.reads(json)
        case SensorTypes.Recurring.name => RecurringSensorProperties.recurringFormat.reads(json)
        case SensorTypes.Time.name => TimeSensorProperties.timeFormat.reads(json)
      }
    }

    override def writes(sensorProperties: SensorProperties): JsValue = sensorProperties match {
      case kafkaProperties: KafkaSensorProperties => KafkaSensorProperties.kafkaFormat.writes(kafkaProperties)
      case absaKafkaProperties: AbsaKafkaSensorProperties => AbsaKafkaSensorProperties.absaKafkaFormat.writes(absaKafkaProperties)
      case recurringProperties: RecurringSensorProperties => RecurringSensorProperties.recurringFormat.writes(recurringProperties)
      case timeSensorProperties: TimeSensorProperties => TimeSensorProperties.timeFormat.writes(timeSensorProperties)
    }
  }
}