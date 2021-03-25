
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
import net.manub.embeddedkafka.EmbeddedKafkaConfig
import org.apache.kafka.clients.producer.{KafkaProducer, ProducerConfig, ProducerRecord}
import org.apache.kafka.common.serialization.StringSerializer
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.{any, eq => eqTo}
import org.mockito.Mockito.{times, verify, when}
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
import play.api.libs.json.Json
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes
import za.co.absa.hyperdrive.trigger.models.{Event, Sensor, Settings, Properties => SensorProperties}
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor

import java.util.Properties
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class KafkaSensorTest extends FlatSpec with MockitoSugar with Matchers with BeforeAndAfter {
  private val matchPropertyKey = "ingestionToken"
  private val kafkaPort = 12345
  private val kafkaUrl = s"localhost:${kafkaPort}"

  before {
    System.setProperty("kafkaSource.poll.duration", "750")
    System.setProperty("kafkaSource.max.poll.records", "20")
  }

  it should "consume notifications and invoke the eventProcessor" in {
    val ingestionToken = "95fce3e7-2468-46fa-9456-74919497528c"
    val notificationMessage = raw"""{"$matchPropertyKey": "$ingestionToken"}"""
    val otherMessage = raw"""{"$matchPropertyKey": "some-other-message"}"""
    executeTestCase(
      ingestionToken,
      Seq(),
      Seq(otherMessage, notificationMessage, otherMessage),
      Some(notificationMessage)
    )
  }

  private def executeTestCase(
    matchPropertyValue: String,
    messagesBeforeSubscription: Seq[String],
    messagesAfterSubscription: Seq[String],
    expectedPayloadOpt: Option[String]) = {
    // given
    implicit val config: EmbeddedKafkaConfig = EmbeddedKafkaConfig(kafkaPort = kafkaPort, zooKeeperPort = 12346)
    val notificationTopic = "notifications"
    val eventProcessor = mock[EventProcessor]

    when(eventProcessor.eventProcessor(any())(any(), any())(any())).thenReturn(Future {true})
    val sensor = Sensor(id = 42, sensorType = SensorTypes.AbsaKafka, properties = SensorProperties(
      sensorId = 42,
      settings = Settings(
        Map(KafkaSettings.Topic -> notificationTopic),
        Map(KafkaSettings.Servers -> List(kafkaUrl))),
      matchProperties = Map(
        matchPropertyKey -> matchPropertyValue
      )))

    val maxPollRetries = 10
    withRunningKafka {
      val producer = createProducer()
      // when

      publishToKafka(producer, notificationTopic, messagesBeforeSubscription)
      val kafkaSensor = new KafkaSensor(eventProcessor.eventProcessor("test"), sensor, global)
      for (_ <- 0 to maxPollRetries){ // hope that consumer will have been assigned partition and is ready to poll
        await(kafkaSensor.poll())
      }
      publishToKafka(producer, notificationTopic, messagesAfterSubscription)

      await(kafkaSensor.poll())

      // then
      val eventsCaptor: ArgumentCaptor[Seq[Event]] = ArgumentCaptor.forClass(classOf[Seq[Event]])
      val propertiesCaptor: ArgumentCaptor[SensorProperties] = ArgumentCaptor.forClass(classOf[SensorProperties])
      val invocations = expectedPayloadOpt match {
        case Some(_) => 1
        case None => 0
      }
      verify(eventProcessor, times(invocations)).eventProcessor(eqTo("test"))(eventsCaptor.capture(), propertiesCaptor.capture())(any())
      expectedPayloadOpt.map(expectedPayload => {
        eventsCaptor.getValue.size shouldBe 1
        val event = eventsCaptor.getValue.head
        event.sensorId shouldBe sensor.properties.sensorId
        event.payload shouldBe Json.parse(expectedPayload)
        propertiesCaptor.getValue shouldBe sensor.properties
      }).getOrElse(succeed)
    }
  }

  private def createProducer() = {
    val props = new Properties()
    val serializer = new StringSerializer()
    props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaUrl)
    new KafkaProducer(props, serializer, serializer)
  }

  private def publishToKafka(producer: KafkaProducer[String, String], topic: String, messages: Seq[String]) = {
    messages.foreach(message => {
      val record = new ProducerRecord[String, String](topic, message)
      producer.send(record)
    })
    producer.flush()
  }

}
