
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
import za.co.absa.hyperdrive.trigger.models.{AbsaKafkaSensorProperties, Event, Sensor}
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor

import java.util.Properties
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import za.co.absa.hyperdrive.trigger.configuration.application.{KafkaConfig, TestKafkaConfig}

class KafkaSensorTest extends FlatSpec with MockitoSugar with Matchers with BeforeAndAfter {
  private val matchPropertyKey = "ingestionToken"
  private val ingestionToken = "95fce3e7-2468-46fa-9456-74919497528c"
  private val kafkaPort = 12345
  private val kafkaUrl = s"localhost:${kafkaPort}"
  private implicit val dummyKafkaConfig: KafkaConfig = TestKafkaConfig()

  before {
    System.setProperty("kafkaSource.poll.duration", "750")
    System.setProperty("kafkaSource.max.poll.records", "20")
  }

  "KafkaSensor.poll" should "consume matching notifications and invoke the eventProcessor once" in {
    val notificationMessage = raw"""{"$matchPropertyKey": "$ingestionToken"}"""
    val otherMessage = raw"""{"$matchPropertyKey": "some-other-message"}"""
    executeTestCase(
      consumeFromLatest = false,
      Seq(),
      Seq(),
      Seq(otherMessage, notificationMessage, notificationMessage, otherMessage),
      Some(notificationMessage)
    )
  }

  it should "not invoke the eventProcessor when messages have already been consumed" in {
    val notificationMessage = raw"""{"$matchPropertyKey": "$ingestionToken"}"""
    executeTestCase(
      consumeFromLatest = false,
      Seq(notificationMessage),
      Seq(),
      Seq(),
      None
    )
  }

  it should "invoke the eventProcessor when messages are sent while consumer is unsubscribed" in {
    val notificationMessage = raw"""{"$matchPropertyKey": "$ingestionToken"}"""
    executeTestCase(
      consumeFromLatest = false,
      Seq(),
      Seq(notificationMessage),
      Seq(),
      Some(notificationMessage)
    )
  }

  it should "not invoke the eventProcessor when consuming only non-matching notifications" in {
    val otherMessage = raw"""{"$matchPropertyKey": "some-other-message"}"""
    executeTestCase(
      consumeFromLatest = false,
      Seq(),
      Seq(),
      Seq(otherMessage, otherMessage),
      None
    )
  }

  "KafkaSensor.poll with consumeFromLatest=true" should "not invoke the eventProcessor when messages are sent while consumer is unsubscribed" in {
    val notificationMessage = raw"""{"$matchPropertyKey": "$ingestionToken"}"""
    executeTestCase(
      consumeFromLatest = true,
      Seq(),
      Seq(notificationMessage),
      Seq(),
      None
    )
  }

  "KafkaSensor.poll" should "have a separate group id for each sensor" in {
    // given
    implicit val config: EmbeddedKafkaConfig = EmbeddedKafkaConfig(kafkaPort = kafkaPort, zooKeeperPort = 12346)
    val notificationTopic = "notifications"
    val eventProcessor1 = mock[EventProcessor]
    val eventProcessor2 = mock[EventProcessor]
    when(eventProcessor1.eventProcessor(any())(any(), any())(any())).thenReturn(Future {true})
    when(eventProcessor2.eventProcessor(any())(any(), any())(any())).thenReturn(Future {true})
    val absaKafkaSensorProperties1 = AbsaKafkaSensorProperties(
      topic = notificationTopic,
      servers = List(kafkaUrl),
      ingestionToken = "match-property-value-42"
    )
    val sensor1 = Sensor(id = 42, properties = absaKafkaSensorProperties1)
    val absaKafkaSensorProperties2 = AbsaKafkaSensorProperties(
      topic = notificationTopic,
      servers = List(kafkaUrl),
      ingestionToken = "match-property-value-43"
    )
    val sensor2 = Sensor(id = 43, properties = absaKafkaSensorProperties2)
    val messages = Seq(
      raw"""{"$matchPropertyKey": "match-property-value-42"}""",
      raw"""{"$matchPropertyKey": "match-property-value-43"}"""
    )
    val maxPollRetries = 10

    withRunningKafka {
      val producer = createProducer()
      val kafkaSensor1 = new AbsaKafkaSensor(eventProcessor1.eventProcessor("test"), sensor1, consumeFromLatest = true, executionContext = global)
      for (_ <- 0 to maxPollRetries){ // hope that consumer will have been assigned partition and is ready to poll
        await(kafkaSensor1.poll())
      }
      val kafkaSensor2 = new AbsaKafkaSensor(eventProcessor2.eventProcessor("test"), sensor2, consumeFromLatest = true, executionContext = global)
      for (_ <- 0 to maxPollRetries){ // hope that consumer will have been assigned partition and is ready to poll
        await(kafkaSensor2.poll())
      }
      publishToKafka(producer, notificationTopic, messages)

      await(kafkaSensor1.poll())
      await(kafkaSensor2.poll())

      verify(eventProcessor1).eventProcessor(eqTo("test"))(any(), any())(any())
      verify(eventProcessor2).eventProcessor(eqTo("test"))(any(), any())(any())
    }
  }

  private def executeTestCase(
    consumeFromLatest: Boolean,
    messagesBeforeUnsubscription: Seq[String],
    messagesWhileUnsubscribed: Seq[String],
    messagesAfterResubscription: Seq[String],
    expectedPayloadOpt: Option[String]) = {
    // given
    implicit val config: EmbeddedKafkaConfig = EmbeddedKafkaConfig(kafkaPort = kafkaPort, zooKeeperPort = 12346)
    val notificationTopic = "notifications"
    val eventProcessor1 = mock[EventProcessor]
    val eventProcessor2 = mock[EventProcessor]

    when(eventProcessor1.eventProcessor(any())(any(), any())(any())).thenReturn(Future {true})
    when(eventProcessor2.eventProcessor(any())(any(), any())(any())).thenReturn(Future {true})
    val absaKafkaSensorProperties = AbsaKafkaSensorProperties(
      topic = notificationTopic,
      servers = List(kafkaUrl),
      ingestionToken = ingestionToken
    )
    val sensor = Sensor(id = 42, properties = absaKafkaSensorProperties)

    val maxPollRetries = 10
    withRunningKafka {
      val producer = createProducer()
      // when

      val kafkaSensor1 = new AbsaKafkaSensor(eventProcessor1.eventProcessor("test"), sensor, consumeFromLatest, global)
      for (_ <- 0 to maxPollRetries){ // hope that consumer will have been assigned partition and is ready to poll
        await(kafkaSensor1.poll())
      }
      publishToKafka(producer, notificationTopic, messagesBeforeUnsubscription)
      await(kafkaSensor1.poll())
      kafkaSensor1.closeInternal()

      publishToKafka(producer, notificationTopic, messagesWhileUnsubscribed)

      val kafkaSensor2 = new AbsaKafkaSensor(eventProcessor2.eventProcessor("test"), sensor, consumeFromLatest, global)
      for (_ <- 0 to maxPollRetries){ // hope that consumer will have been assigned partition and is ready to poll
        await(kafkaSensor2.poll())
      }
      publishToKafka(producer, notificationTopic, messagesAfterResubscription)
      await(kafkaSensor2.poll())

      // then
      val eventsCaptor: ArgumentCaptor[Seq[Event]] = ArgumentCaptor.forClass(classOf[Seq[Event]])
      val sensorIdCaptor: ArgumentCaptor[Long] = ArgumentCaptor.forClass(classOf[Long])
      val invocations = expectedPayloadOpt match {
        case Some(_) => 1
        case None => 0
      }
      verify(eventProcessor2, times(invocations)).eventProcessor(eqTo("test"))(eventsCaptor.capture(), sensorIdCaptor.capture())(any())
      expectedPayloadOpt.map(expectedPayload => {
        eventsCaptor.getValue.size shouldBe 1
        val event = eventsCaptor.getValue.head
        event.sensorId shouldBe sensor.id
        event.payload shouldBe Json.parse(expectedPayload)
      }).getOrElse(succeed)
    }
  }

  private def createProducer() = {
    val props = new Properties()
    val serializer = new StringSerializer()
    props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaUrl)
    new KafkaProducer(props, serializer, serializer)
  }

  private def publishToKafka(producer: KafkaProducer[String, String], topic: String, messages: Seq[String]): Unit = {
    messages.foreach(message => {
      val record = new ProducerRecord[String, String](topic, message)
      producer.send(record)
    })
    producer.flush()
  }

}
