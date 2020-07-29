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

import java.time.Duration
import java.util.Collections

import org.apache.kafka.clients.consumer.{ConsumerRecord, KafkaConsumer}
import play.api.libs.json.{JsError, JsSuccess, Json}
import za.co.absa.hyperdrive.trigger.models.{Event, Properties, Sensor}
import za.co.absa.hyperdrive.trigger.scheduler.sensors.PollSensor
import za.co.absa.hyperdrive.trigger.scheduler.utilities.KafkaConfig

import scala.concurrent.{ExecutionContext, Future}
import za.co.absa.hyperdrive.trigger.scheduler.utilities.KafkaRichConsumer._
import org.slf4j.LoggerFactory

import scala.util.{Failure, Success, Try}

class KafkaSensor(
  eventsProcessor: (Seq[Event], Properties) => Future[Boolean],
  sensorDefinition: Sensor,
  executionContext: ExecutionContext
) extends PollSensor(eventsProcessor, sensorDefinition, executionContext) {

  private val properties = sensorDefinition.properties
  private val logger = LoggerFactory.getLogger(this.getClass)
  private val logMsgPrefix = s"Sensor id = ${properties.sensorId}."
  private val kafkaSettings = KafkaSettings(properties.settings)

  private val consumer = new KafkaConsumer[String, String](KafkaConfig.getConsumerProperties(kafkaSettings))

  try {
    consumer.subscribe(Collections.singletonList(kafkaSettings.topic))
  } catch {
    case e: Exception => logger.debug(s"$logMsgPrefix. Exception during subscribe.", e)
  }

  override def poll(): Future[Unit] = {
    logger.debug(s"$logMsgPrefix. Polling new events.")
    val fut = Future {
      consumer.pollAsScala(Duration.ofMillis(KafkaConfig.getPollDuration))
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
        properties.matchProperties.forall { matchProperty =>
          (event.payload \ matchProperty._1).validate[String] match {
            case JsSuccess(value, _) => value == matchProperty._2
            case _: JsError => false
          }
        }
      }
      eventsProcessor.apply(matchedEvents, properties).map(_ => (): Unit)
    } else
      Future.successful((): Unit)
  }

  private def recordToEvent[A](record: ConsumerRecord[A, String]): Event = {
    val sourceEventId = properties.sensorId + "kafka" + record.topic() + record.partition() + record.offset()
    val payload = Try(
      Json.parse(record.value())
    ).getOrElse {
      logger.debug(s"$logMsgPrefix. Invalid message.")
      Json.parse(s"""{"errorMessage": "${record.value()}"}""")
    }
    Event(sourceEventId, properties.sensorId, payload)
  }

  override def closeInternal(): Unit = {
    consumer.unsubscribe()
  }

}
