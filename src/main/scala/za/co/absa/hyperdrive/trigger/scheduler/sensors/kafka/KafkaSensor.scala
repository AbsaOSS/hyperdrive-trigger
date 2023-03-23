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
import za.co.absa.hyperdrive.trigger.configuration.application.{GeneralConfig, KafkaConfig}
import za.co.absa.hyperdrive.trigger.models.{Event, KafkaSensorProperties}
import za.co.absa.hyperdrive.trigger.scheduler.sensors.PollSensor

import java.time.Duration
import java.util
import java.util.Collections
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}
import za.co.absa.hyperdrive.trigger.models.{Sensor => SensorDefition}
import za.co.absa.hyperdrive.trigger.scheduler.utilities.logging.LazyToStr

class KafkaSensor(
  eventsProcessor: (Seq[Event], Long) => Future[Boolean],
  sensorDefinition: SensorDefition[KafkaSensorProperties]
)(implicit kafkaConfig: KafkaConfig, generalConfig: GeneralConfig, executionContext: ExecutionContext)
    extends PollSensor[KafkaSensorProperties](eventsProcessor, sensorDefinition, executionContext) {

  private val logger = LoggerFactory.getLogger(this.getClass)

  private val consumer = {
    val consumerProperties = kafkaConfig.properties
    val servers = sensorDefinition.properties.servers.mkString(",")
    consumerProperties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, servers)
    val groupId = s"${kafkaConfig.groupIdPrefix}-${generalConfig.appUniqueId}-${sensorDefinition.id}"
    consumerProperties.put(ConsumerConfig.GROUP_ID_CONFIG, groupId)

    new KafkaConsumer[String, String](consumerProperties)
  }

  try {
    consumer.subscribe(
      Collections.singletonList(sensorDefinition.properties.topic),
      new ConsumerRebalanceListener {
        override def onPartitionsRevoked(partitions: util.Collection[TopicPartition]): Unit = {
          // no-op
        }

        override def onPartitionsAssigned(partitions: util.Collection[TopicPartition]): Unit =
          if (!kafkaConfig.alwaysCatchup) {
            consumer.seekToEnd(partitions)
          }
      }
    )
  } catch {
    case e: Exception => logger.error(s"(SensorId=${sensorDefinition.id}). Exception during subscribe.", e)
  }

  override def poll(): Future[Unit] = {
    import scala.collection.JavaConverters._
    logger.debug("(SensorId={}). Polling new events.", sensorDefinition.id)
    val fut = Future {
      consumer.poll(Duration.ofMillis(kafkaConfig.pollDuration)).asScala
    } flatMap processRecords map (_ => consumer.commitSync())

    fut.onComplete {
      case Success(_) => logger.debug("(SensorId={}). Polling successful", sensorDefinition.id)
      case Failure(exception) =>
        logger.warn(s"(SensorId=${sensorDefinition.id}). Polling failed.", exception)
    }

    fut
  }

  private def processRecords[A](records: Iterable[ConsumerRecord[A, String]]): Future[Unit] = {
    logger.debug(s"(SensorId={}). Messages received = {}", sensorDefinition.id, new LazyToStr(records.map(_.value())))
    if (records.nonEmpty) {
      val events = records.map(recordToEvent).toSeq
      val matchedEvents = events.filter { event =>
        sensorDefinition.properties.matchProperties.forall { matchProperty =>
          (event.payload \ matchProperty._1).validate[String] match {
            case JsSuccess(value, _) => value == matchProperty._2
            case _: JsError          => false
          }
        }
      }
      matchedEvents.headOption
        .map(matchedEvent => eventsProcessor.apply(Seq(matchedEvent), sensorDefinition.id).map(_ => (): Unit))
        .getOrElse(Future.successful((): Unit))
    } else {
      Future.successful((): Unit)
    }
  }

  private def recordToEvent[A](record: ConsumerRecord[A, String]): Event = {
    val sourceEventId = sensorDefinition.id + "kafka" + record.topic() + record.partition() + record.offset()
    val payload = Try(Json.parse(record.value())).getOrElse {
      logger.error(s"(SensorId={}). Invalid message.", sensorDefinition.id)
      Json.parse(s"""{"errorMessage": "${record.value()}"}""")
    }
    Event(sourceEventId, sensorDefinition.id, payload)
  }

  override def closeInternal(): Unit =
    consumer.unsubscribe()

}
