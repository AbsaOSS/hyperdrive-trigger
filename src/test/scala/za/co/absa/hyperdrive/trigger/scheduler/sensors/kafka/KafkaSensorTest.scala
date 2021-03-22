
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

package za.co.absa.hyperdrive.trigger.scheduler.sensors.kafka

import net.manub.embeddedkafka.EmbeddedKafka.withRunningKafka
import net.manub.embeddedkafka.{EmbeddedKafka, EmbeddedKafkaConfig}
import org.apache.kafka.common.serialization.StringSerializer
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.{any, eq => eqTo}
import org.mockito.Mockito.{verify, when}
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
import play.api.libs.json.Json
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes
import za.co.absa.hyperdrive.trigger.models.{Event, Sensor, Settings, Properties => SensorProperties}
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor

import java.util.UUID.randomUUID
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class KafkaSensorTest extends FlatSpec with MockitoSugar with Matchers with BeforeAndAfter {
  private val eventProcessor = mock[EventProcessor]

  before {
    System.setProperty("kafkaSource.poll.duration", "750")
  }

  it should "consume notifications and invoke the eventProcessor" in {
    // given
    implicit val config: EmbeddedKafkaConfig = EmbeddedKafkaConfig(kafkaPort = 12345, zooKeeperPort = 12346)
    val notificationTopic = "notifications"
    val matchPropertyKey = "ingestionToken"
    val matchPropertyValue = randomUUID().toString

    when(eventProcessor.eventProcessor(any())(any(), any())(any())).thenReturn(Future {true})
    val sensor = Sensor(id = 42, sensorType = SensorTypes.AbsaKafka, properties = SensorProperties(
      sensorId = 42,
      settings = Settings(
        Map(KafkaSettings.Topic -> notificationTopic),
        Map(KafkaSettings.Servers -> List(s"localhost:${config.kafkaPort}"))),
      matchProperties = Map(
        matchPropertyKey -> matchPropertyValue
      )))

    val maxPollRetries = 10
    withRunningKafka {
      val notificationMessage = raw"""{"$matchPropertyKey": "$matchPropertyValue"}"""
      val otherMessage = raw"""{"$matchPropertyKey": "${randomUUID()}"}"""
      val serializer = new StringSerializer

      // when
      val kafkaSensor = new KafkaSensor(eventProcessor.eventProcessor("test"), sensor, global)
      for (_ <- 0 to maxPollRetries){ // hope that consumer will have been assigned partition and is ready to poll
        await(kafkaSensor.poll())
      }

      EmbeddedKafka.publishToKafka(notificationTopic, notificationMessage)(config, serializer)
      EmbeddedKafka.publishToKafka(notificationTopic, otherMessage)(config, serializer)
      await(kafkaSensor.poll())

      // then
      val eventsCaptor: ArgumentCaptor[Seq[Event]] = ArgumentCaptor.forClass(classOf[Seq[Event]])
      val propertiesCaptor: ArgumentCaptor[SensorProperties] = ArgumentCaptor.forClass(classOf[SensorProperties])
      verify(eventProcessor).eventProcessor(eqTo("test"))(eventsCaptor.capture(), propertiesCaptor.capture())(any())
      val event = eventsCaptor.getValue.head
      event.sensorId shouldBe sensor.properties.sensorId
      event.payload shouldBe Json.parse(notificationMessage)
      propertiesCaptor.getValue shouldBe sensor.properties
    }
  }
}
