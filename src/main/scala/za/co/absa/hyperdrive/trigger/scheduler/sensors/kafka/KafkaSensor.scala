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

import org.apache.kafka.clients.consumer.{ConsumerConfig, ConsumerRebalanceListener, ConsumerRecord, KafkaConsumer}
import org.apache.kafka.common.TopicPartition
import org.slf4j.LoggerFactory
import play.api.libs.json.{JsError, JsSuccess, Json}
import za.co.absa.hyperdrive.trigger.models.{Event, KafkaSensorProperties}
import za.co.absa.hyperdrive.trigger.scheduler.sensors.PollSensor
import za.co.absa.hyperdrive.trigger.scheduler.utilities.KafkaConfig

import java.time.Duration
import java.util
import java.util.Collections
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}
import za.co.absa.hyperdrive.trigger.models.{Sensor => SensorDefition}

class KafkaSensor(
  eventsProcessor: (Seq[Event], Long) => Future[Boolean],
  sensorDefinition: SensorDefition[KafkaSensorProperties],
  consumeFromLatest: Boolean = false,
  executionContext: ExecutionContext
) extends PollSensor[KafkaSensorProperties](eventsProcessor, sensorDefinition, executionContext) {

  private val logger = LoggerFactory.getLogger(this.getClass)
  private val logMsgPrefix = s"Sensor id = ${sensorDefinition.id}."

  private val consumer = {
    val consumerProperties = KafkaConfig.getConsumerProperties(sensorDefinition.properties)
    val groupId = s"${KafkaConfig.getBaseGroupId}-${sensorDefinition.id}"
    consumerProperties.put(ConsumerConfig.GROUP_ID_CONFIG, groupId)

    new KafkaConsumer[String, String](consumerProperties)
  }

  try {
    consumer.subscribe(Collections.singletonList(sensorDefinition.properties.topic), new ConsumerRebalanceListener {
      override def onPartitionsRevoked(partitions: util.Collection[TopicPartition]): Unit = {
        // no-op
      }

      override def onPartitionsAssigned(partitions: util.Collection[TopicPartition]): Unit = {
        if (consumeFromLatest) {
          consumer.seekToEnd(partitions)
        }
      }
    })
  } catch {
    case e: Exception => logger.debug(s"$logMsgPrefix. Exception during subscribe.", e)
  }

  override def poll(): Future[Unit] = {
    import scala.collection.JavaConverters._
    logger.debug(s"$logMsgPrefix. Polling new events.")
    val fut = Future {
      consumer.poll(Duration.ofMillis(KafkaConfig.getPollDuration)).asScala
    } flatMap processRecords map (_ => consumer.commitSync())

    fut.onComplete {
      case Success(_) => logger.debug(s"$logMsgPrefix. Polling successful")
      case Failure(exception) => {
        logger.debug(s"$logMsgPrefix. Polling failed.", exception)
      }
    }

    fut
  }

  private def processRecords[A](records: Iterable[ConsumerRecord[A, String]]): Future[Unit] = {
    logger.debug(s"$logMsgPrefix. Messages received = ${records.map(_.value())}")
    if (records.nonEmpty) {
      val events = records.map(recordToEvent).toSeq
      val matchedEvents = events.filter { event =>
        sensorDefinition.properties.matchProperties.forall { matchProperty =>
          (event.payload \ matchProperty._1).validate[String] match {
            case JsSuccess(value, _) => value == matchProperty._2
            case _: JsError => false
          }
        }
      }
      matchedEvents.headOption.map(matchedEvent => {
        eventsProcessor.apply(Seq(matchedEvent), sensorDefinition.id).map(_ => (): Unit)
      }).getOrElse(Future.successful((): Unit))
    } else {
      Future.successful((): Unit)
    }
  }

  private def recordToEvent[A](record: ConsumerRecord[A, String]): Event = {
    val sourceEventId = sensorDefinition.id + "kafka" + record.topic() + record.partition() + record.offset()
    val payload = Try(
      Json.parse(record.value())
    ).getOrElse {
      logger.debug(s"$logMsgPrefix. Invalid message.")
      Json.parse(s"""{"errorMessage": "${record.value()}"}""")
    }
    Event(sourceEventId, sensorDefinition.id, payload)
  }

  override def closeInternal(): Unit = {
    consumer.unsubscribe()
  }

}
