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
import za.co.absa.hyperdrive.trigger.configuration.application.{GeneralConfig, KafkaConfig}
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.models.{ResolvedJobDefinition, SparkInstanceParameters}

import java.util.Properties
import javax.inject.Inject
import scala.collection.mutable

trait KafkaService {
    def getKafkaProperties(jobDefinition: ResolvedJobDefinition): Option[(String, Properties)]
    def getEndOffsets(topic: String, consumerProperties: Properties): Map[Int, Long]
}

@Service
class KafkaServiceImpl @Inject() (kafkaConfig: KafkaConfig, generalConfig: GeneralConfig) extends KafkaService {
  private val logger = LoggerFactory.getLogger(this.getClass)
  private val kafkaConsumersCache: mutable.Map[Properties, KafkaConsumer[String, String]] = mutable.Map()
  private val HyperdriveKafkaTopicKey = "reader.kafka.topic"
  private val HyperdriveKafkaBrokersKey = "reader.kafka.brokers"
  private val HyperdriveKafkaExtraOptionsKey = "reader.option.kafka"

  override def getKafkaProperties(jobDefinition: ResolvedJobDefinition): Option[(String, Properties)] = {
    if (jobDefinition.jobParameters.jobType != JobTypes.Hyperdrive ||
      !jobDefinition.jobParameters.isInstanceOf[SparkInstanceParameters]) {
      None
    } else {
      val args = jobDefinition.jobParameters.asInstanceOf[SparkInstanceParameters].appArguments
      val topicOpt = args.find(_.startsWith(s"$HyperdriveKafkaTopicKey="))
        .map(_.replace(s"$HyperdriveKafkaTopicKey=", ""))
      val kafkaBrokersOpt = args.find(_.startsWith(s"$HyperdriveKafkaBrokersKey="))
        .map(_.replace(s"$HyperdriveKafkaBrokersKey=", ""))
      val kafkaArgs = args.filter(_.startsWith(s"$HyperdriveKafkaExtraOptionsKey."))
        .map(_.replace(s"$HyperdriveKafkaExtraOptionsKey.", ""))
        .filter(_.contains("="))
        .map { s =>
          val keyValue = s.split("=", 2)
          val key = keyValue(0).trim
          val value = keyValue(1).trim
          (key, value)
        }
        .toMap
      val properties = new Properties()
      kafkaArgs.foreach { case (key, value) => properties.setProperty(key, value)}

      (topicOpt, kafkaBrokersOpt) match {
        case (Some(topic), Some(kafkaBrokers)) =>
          properties.setProperty(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaBrokers)
          Some(topic, properties)
        case (_, _) =>
          logger.warn(s"Topic and/or bootstrap servers could not be found in app arguments for jobDefinition" +
            s" ${jobDefinition.name}. Topic: ${topicOpt}, Bootstrap servers: ${kafkaBrokersOpt}")
          None
      }
    }
  }

  override def getEndOffsets(topic: String, consumerProperties: Properties): Map[Int, Long] = {
    val groupId = s"${kafkaConfig.groupIdPrefix}-${generalConfig.appUniqueId}-getEndOffsets"
    consumerProperties.put(ConsumerConfig.GROUP_ID_CONFIG, groupId)
    val consumer = kafkaConsumersCache.getOrElse(consumerProperties, {
      val consumer = new KafkaConsumer[String, String](consumerProperties)
      kafkaConsumersCache.put(consumerProperties, consumer)
      consumer
    })

    import scala.collection.JavaConverters._
    val partitionInfo = consumer.partitionsFor(topic).asScala
    val topicPartitions = partitionInfo.map(p => new TopicPartition(p.topic(), p.partition()))
    consumer.endOffsets(topicPartitions.asJava)
      .asScala
      .map {
        case (topicPartition: TopicPartition, offset: java.lang.Long) => topicPartition.partition() -> offset.longValue()
      }
      .toMap
  }
}
