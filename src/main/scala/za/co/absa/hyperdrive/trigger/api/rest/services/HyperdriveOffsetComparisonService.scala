
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
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.driver.drivers.CommandLineIngestionDriver
import za.co.absa.hyperdrive.trigger.configuration.application.SparkConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.models.{ResolvedJobDefinition, SparkInstanceParameters}

import java.util.Properties
import javax.inject.Inject

trait HyperdriveOffsetComparisonService {
  def getResolvedAppArguments(jobDefinition: ResolvedJobDefinition): Option[Map[String, String]]
  def getHdfsParameters(resolvedAppArguments: Map[String, String]): Option[HdfsParameters]
  def getKafkaParameters(jobDefinition: ResolvedJobDefinition): Option[(String, Properties)]
  def isNewJobInstanceRequired(jobDefinition: ResolvedJobDefinition): Boolean
}

@Service
class HyperdriveOffsetComparisonServiceImpl @Inject()(
  sparkConfig: SparkConfig,
  hdfsService: HdfsService,
  kafkaService: KafkaService) extends HyperdriveOffsetComparisonService {
  private val logger = LoggerFactory.getLogger(this.getClass)
  private val HyperdriveCheckpointKey = "writer.common.checkpoint.location"
  private val HyperdriveKafkaTopicKey = "reader.kafka.topic"
  private val HyperdriveKafkaBrokersKey = "reader.kafka.brokers"
  private val HyperdriveKafkaExtraOptionsKey = "reader.option.kafka"

  override def getResolvedAppArguments(jobDefinition: ResolvedJobDefinition): Option[Map[String, String]] = {
    if (isHyperdriveJob(jobDefinition)) {
      logger.warn(s"Job Definition ${jobDefinition} is not a Hyperdrive Job!")
      None
    } else {
      val jobParameters = jobDefinition.jobParameters.asInstanceOf[SparkInstanceParameters]
      val args = jobParameters.appArguments
      val config = CommandLineIngestionDriver.parseConfiguration(args.toArray)
      import scala.collection.JavaConverters._
      val resolvedArgs = config.getKeys.asScala.map {
        k => k -> config.getString(k)
      }.toMap
      Some(resolvedArgs)
    }
  }

  override def getHdfsParameters(resolvedAppArguments: Map[String, String]): Option[HdfsParameters] = {
    val hdfsParameters = for {
      keytab <- sparkConfig.yarn.additionalConfs.get("spark.yarn.keytab")
      principal <- sparkConfig.yarn.additionalConfs.get("spark.yarn.principal")
      checkpointLocation <- resolvedAppArguments.get(HyperdriveCheckpointKey)
    } yield new HdfsParameters(keytab, principal, checkpointLocation)

    if (hdfsParameters.isEmpty) {
      logger.warn(s"Could not extract hdfs parameters from spark config ${sparkConfig}" +
        s" and resolved app arguments ${resolvedAppArguments}")
    }

    hdfsParameters
  }

  override def getKafkaParameters(jobDefinition: ResolvedJobDefinition): Option[(String, Properties)] = {
    if (isHyperdriveJob(jobDefinition)) {
      logger.warn(s"Job Definition ${jobDefinition} is not a Hyperdrive Job!")
      None
    } else {
      val args = jobDefinition.jobParameters.asInstanceOf[SparkInstanceParameters].appArguments
      val kafkaParameters = for {
        topic <- args
          .find(_.startsWith(s"$HyperdriveKafkaTopicKey="))
          .map(_.replace(s"$HyperdriveKafkaTopicKey=", ""))
        brokers <- args
          .find(_.startsWith(s"$HyperdriveKafkaBrokersKey="))
          .map(_.replace(s"$HyperdriveKafkaBrokersKey=", ""))
        extraArgs = args
          .filter(_.startsWith(s"$HyperdriveKafkaExtraOptionsKey."))
          .map(_.replace(s"$HyperdriveKafkaExtraOptionsKey.", ""))
          .filter(_.contains("="))
          .map { s =>
            val keyValue = s.split("=", 2)
            val key = keyValue(0).trim
            val value = keyValue(1).trim
            (key, value)
          }
          .toMap
      } yield {
        val properties = new Properties()
        properties.setProperty(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, brokers)
        extraArgs.foreach { case (key, value) => properties.setProperty(key, value) }
        (topic, properties)
      }

      if (kafkaParameters.isEmpty) {
        logger.warn(s"Could not find required kafka parameters in job definition ${jobDefinition.name} with args ${args}")
      }
      kafkaParameters
    }
  }

  private def isHyperdriveJob(jobDefinition: ResolvedJobDefinition) =
    jobDefinition.jobParameters.jobType != JobTypes.Hyperdrive ||
      !jobDefinition.jobParameters.isInstanceOf[SparkInstanceParameters]

  override def isNewJobInstanceRequired(jobDefinition: ResolvedJobDefinition): Boolean = {
    val latestOffsetFilePath = for {
      resolvedAppArguments <- getResolvedAppArguments(jobDefinition)
      hdfsParameters <- getHdfsParameters(resolvedAppArguments)
      latestOffsetFilePath <- hdfsService.getLatestOffsetFilePath(hdfsParameters)
    } yield latestOffsetFilePath

    if (latestOffsetFilePath.isEmpty || !latestOffsetFilePath.get._2) {
      logger.debug(s"New job instance required because offset does not exist or is not committed ${latestOffsetFilePath}")
      true
    } else {
      val allKafkaOffsetsConsumedOpt = for {
        kafkaParameters <- getKafkaParameters(jobDefinition)
        hdfsAllOffsets <- hdfsService.parseFileAndClose(latestOffsetFilePath.get._1, hdfsService.parseKafkaOffsetStream)
        hdfsOffsets <- hdfsAllOffsets.get(kafkaParameters._1) match {
          case Some(v) => Some(v)
          case None =>
            logger.warn(s"Could not find offsets for topic ${kafkaParameters._1} in hdfs offsets ${hdfsAllOffsets}")
            None
        }
        kafkaOffsets = kafkaService.getEndOffsets(kafkaParameters._1, kafkaParameters._2)
      } yield {
        val equalKeys = kafkaOffsets.keySet == hdfsOffsets.keySet
        equalKeys && kafkaOffsets.forall {
          case (partition, kafkaPartitionOffset) => hdfsOffsets(partition) == kafkaPartitionOffset
        }
      }

      allKafkaOffsetsConsumedOpt match {
        case Some(allKafkaOffsetsConsumed) => !allKafkaOffsetsConsumed
        case None => true
      }
    }
  }
}
