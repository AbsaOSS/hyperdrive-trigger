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

import org.apache.kafka.clients.consumer.{ConsumerConfig, KafkaConsumer}
import org.apache.kafka.common.TopicPartition
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.util.ConcurrentLruCache
import za.co.absa.hyperdrive.trigger.api.rest.services.KafkaServiceImpl.{BeginningOffsets, EndOffsets, OffsetFunction}
import za.co.absa.hyperdrive.trigger.configuration.application.GeneralConfig

import java.util.Properties
import java.util.UUID.randomUUID
import javax.inject.Inject
import scala.collection.JavaConverters._

trait KafkaService {
  def getBeginningOffsets(topic: String, consumerProperties: Properties): Map[Int, Long]
  def getEndOffsets(topic: String, consumerProperties: Properties): Map[Int, Long]
}

@Service
class KafkaServiceImpl @Inject() (generalConfig: GeneralConfig) extends KafkaService {
  private val logger = LoggerFactory.getLogger(this.getClass)
  private val consumerUuid = randomUUID().toString
  private val kafkaConsumersCache = new ConcurrentLruCache[(Properties, Long), KafkaConsumer[String, String]](
    generalConfig.kafkaConsumersCacheSize,
    createKafkaConsumer
  )

  override def getBeginningOffsets(topic: String, consumerProperties: Properties): Map[Int, Long] = {
    getOffsets(topic, consumerProperties, BeginningOffsets)
  }

  override def getEndOffsets(topic: String, consumerProperties: Properties): Map[Int, Long] = {
    getOffsets(topic, consumerProperties, EndOffsets)
  }

  def createKafkaConsumer(propertiesThreadId: (Properties, Long)): KafkaConsumer[String, String] = {
    logger.info(
      s"Creating new Kafka Consumer for thread id ${propertiesThreadId._2} and" +
        s" properties ${propertiesThreadId._1}. Current cache size is ${kafkaConsumersCache.size()}"
    )
    new KafkaConsumer[String, String](propertiesThreadId._1)
  }

  private def getOffsets(topic: String, properties: Properties, offsetFn: OffsetFunction): Map[Int, Long] = {
    val groupId = s"hyperdrive-trigger-kafkaService-$consumerUuid"
    properties.put(ConsumerConfig.GROUP_ID_CONFIG, groupId)
    val consumer = kafkaConsumersCache.get((properties, Thread.currentThread().getId))
    val partitionInfo = Option(consumer.partitionsFor(topic)).map(_.asScala).getOrElse(Seq())
    val topicPartitions = partitionInfo.map(p => new TopicPartition(p.topic(), p.partition()))
    val offsets = offsetFn match {
      case KafkaServiceImpl.BeginningOffsets => consumer.beginningOffsets(topicPartitions.asJava)
      case KafkaServiceImpl.EndOffsets       => consumer.endOffsets(topicPartitions.asJava)
    }
    Option(offsets)
      .map(_.asScala)
      .getOrElse(Map())
      .map { case (topicPartition: TopicPartition, offset: java.lang.Long) =>
        topicPartition.partition() -> offset.longValue()
      }
      .toMap
  }

}

object KafkaServiceImpl {
  sealed abstract class OffsetFunction
  case object BeginningOffsets extends OffsetFunction
  case object EndOffsets extends OffsetFunction
}
