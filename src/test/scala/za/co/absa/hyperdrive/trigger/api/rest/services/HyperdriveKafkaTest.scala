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

package za.co.absa.hyperdrive.trigger.api.rest.services

import org.apache.kafka.clients.consumer.ConsumerConfig
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers}
import za.co.absa.hyperdrive.trigger.configuration.application.{KafkaConfig, TestGeneralConfig}

import java.util.Properties

class HyperdriveKafkaTest extends AsyncFlatSpec with Matchers with BeforeAndAfter with MockitoSugar {
  private val kafkaProperties = {
    val properties = new Properties()
    properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092")
    properties.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer")
    properties.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer")
    properties.put("max.poll.records", "100")
    properties
  }

  private val kafkaConfig = new KafkaConfig(new Properties(), "group.id.prefix", 500L)
  private val generalConfig = TestGeneralConfig()
  private val kafkaService = new KafkaServiceImpl(kafkaConfig, generalConfig)

  "getResolvedAppArguments" should "return the resolved app arguments" in {
    val result = kafkaService.getEndOffsets("test-topic", kafkaProperties)
    succeed
  }
}
