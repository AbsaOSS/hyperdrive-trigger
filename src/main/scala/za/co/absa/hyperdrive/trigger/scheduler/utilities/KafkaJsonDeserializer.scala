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

package za.co.absa.hyperdrive.trigger.scheduler.utilities

import java.util

import org.apache.kafka.common.serialization.Deserializer
import play.api.libs.json.{JsValue, Json}

class KafkaJsonDeserializer extends Deserializer[Either[String, JsValue]] {

  override def configure(configs: util.Map[String, _], isKey: Boolean): Unit = {}

  override def deserialize(topic: String, data: Array[Byte]): Either[String, JsValue] =
    try {
      Right(Json.parse(data))
    } catch {
      case _: Exception => Left(new String(data))
    }

  override def close(): Unit = {}

}