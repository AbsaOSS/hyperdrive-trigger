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

import org.apache.commons.configuration2.builder.BasicConfigurationBuilder
import org.apache.commons.configuration2.builder.fluent.Parameters
import org.apache.commons.configuration2.convert.DefaultListDelimiterHandler
import org.apache.commons.configuration2.{BaseConfiguration, Configuration}
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.configuration.application.SparkConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.models.{JobInstanceParameters, SparkInstanceParameters}

import java.util.Properties
import javax.inject.Inject
import scala.concurrent.{ExecutionContext, Future}

trait HyperdriveOffsetComparisonService {
  def isNewJobInstanceRequired(jobParameters: JobInstanceParameters)(implicit ec: ExecutionContext): Future[Boolean]
}

@Service
class HyperdriveOffsetComparisonServiceImpl @Inject() (sparkConfig: SparkConfig,
                                                       checkpointService: CheckpointService,
                                                       kafkaService: KafkaService
) extends HyperdriveOffsetComparisonService {
  private val logger = LoggerFactory.getLogger(this.getClass)
  private val HyperdriveCheckpointKey = "writer.common.checkpoint.location"
  private val HyperdriveKafkaTopicKey = "reader.kafka.topic"
  private val HyperdriveKafkaBrokersKey = "reader.kafka.brokers"
  private val HyperdriveKafkaExtraOptionsKey = "reader.option.kafka"
  private val PropertyDelimiter = "="
  private val ListDelimiter = ','


  def isNewJobInstanceRequired(jobParameters: JobInstanceParameters)(implicit ec: ExecutionContext): Future[Boolean] = {
    val kafkaParametersOpt = getKafkaParameters(jobParameters)
    if (kafkaParametersOpt.isEmpty) {
      logger.debug(s"Kafka parameters were not found in job definition ${jobParameters}")
    }

    val kafkaEndOffsetsOptFut = Future {
      kafkaParametersOpt.map { kafkaParameters =>
        kafkaService.getEndOffsets(kafkaParameters._1, kafkaParameters._2)
      }
    }

    val kafkaBeginningOffsetsOptFut = Future {
      kafkaParametersOpt.map { kafkaParameters =>
        kafkaService.getBeginningOffsets(kafkaParameters._1, kafkaParameters._2)
      }
    }

    val isNewJobInstanceRequiredFut = kafkaEndOffsetsOptFut.flatMap { kafkaEndOffsetsOpt =>
      kafkaBeginningOffsetsOptFut.flatMap { kafkaBeginningOffsetsOpt =>
        (kafkaBeginningOffsetsOpt, kafkaEndOffsetsOpt) match {
          case (Some(kafkaBeginningOffsets), Some(kafkaEndOffsets)) =>
            if (kafkaBeginningOffsets.isEmpty) { // topic does not exist
              Future { false }
            } else if (offsetsEqual(kafkaBeginningOffsets, kafkaEndOffsets)) { // topic is empty
              Future { false }
            } else {
              getCheckpointOffsets(jobParameters, kafkaParametersOpt).map {
                case Some(checkpointOffsets) => !offsetsConsumed(checkpointOffsets, kafkaEndOffsets)
                case _                       => true
              }
            }
          case _ => Future { true }
        }
      }
    }

    isNewJobInstanceRequiredFut.recover { case e: Exception =>
      logger.warn("An error occurred while getting offsets", e)
      true
    }
  }

  private def getResolvedAppArguments(jobParameters: JobInstanceParameters): Option[Map[String, String]] = {
    if (!isHyperdriveJob(jobParameters)) {
      logger.warn(s"Job Parameters ${jobParameters} is not a Hyperdrive Job!")
      None
    } else {
      val sparkParameters = jobParameters.asInstanceOf[SparkInstanceParameters]
      val args = sparkParameters.appArguments
      val config = parseConfiguration(args.toArray)
      import scala.collection.JavaConverters._
      val resolvedArgs = config.getKeys.asScala.map { k =>
        k -> config.getString(k)
      }.toMap
      Some(resolvedArgs)
    }
  }

  private def getHdfsParameters(resolvedAppArguments: Map[String, String]): Option[HdfsParameters] = {
    val hdfsParameters = for {
      keytab <- sparkConfig.yarn.additionalConfs.get("spark.yarn.keytab")
      principal <- sparkConfig.yarn.additionalConfs.get("spark.yarn.principal")
      checkpointLocation <- resolvedAppArguments.get(HyperdriveCheckpointKey)
    } yield new HdfsParameters(keytab, principal, checkpointLocation)

    if (hdfsParameters.isEmpty) {
      logger.warn(
        s"Could not extract hdfs parameters from spark config ${sparkConfig}" +
          s" and resolved app arguments ${resolvedAppArguments}"
      )
    }

    hdfsParameters
  }

  private def getKafkaParameters(jobParameters: JobInstanceParameters): Option[(String, Properties)] = {
    if (!isHyperdriveJob(jobParameters)) {
      logger.warn(s"Job Definition ${jobParameters} is not a Hyperdrive Job!")
      None
    } else {
      val args = jobParameters.asInstanceOf[SparkInstanceParameters].appArguments
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
        logger.warn(
          s"Could not find required kafka parameters in job parameters ${jobParameters} with args ${args}"
        )
      }
      kafkaParameters
    }
  }

  private def isHyperdriveJob(jobParameters: JobInstanceParameters) =
    jobParameters.jobType == JobTypes.Hyperdrive &&
      jobParameters.isInstanceOf[SparkInstanceParameters]

  private def getCheckpointOffsets(jobParameters: JobInstanceParameters,
                                   kafkaParametersOpt: Option[(String, Properties)]
  )(implicit ec: ExecutionContext): Future[Option[Map[Int, Long]]] = {
    val hdfsParametersOpt = getResolvedAppArguments(jobParameters).flatMap(getHdfsParameters)

    if (hdfsParametersOpt.isEmpty) {
      logger.debug(s"Hdfs parameters were not found in job definition ${jobParameters}")
    }

    Future {
      val latestOffsetOpt = for {
        hdfsParameters <- hdfsParametersOpt
        _ = checkpointService.loginUserFromKeytab(hdfsParameters.principal, hdfsParameters.keytab)
        latestOffset <- checkpointService.getLatestOffsetFilePath(hdfsParameters)
      } yield { latestOffset }
      if (latestOffsetOpt.isEmpty || !latestOffsetOpt.get._2) {
        logger.debug(s"Offset does not exist or is not committed ${latestOffsetOpt}")
        None
      } else {
        latestOffsetOpt
      }
    }.flatMap {
      case None                                  => Future { None }
      case Some(_) if kafkaParametersOpt.isEmpty => Future { None }
      case Some(latestOffset) =>
        Future {
          checkpointService.getOffsetsFromFile(latestOffset._1)
        }.recover { case e: Exception =>
          logger.warn(s"Couldn't parse file ${latestOffset._1}", e)
          None
        }
    }.map { hdfsAllOffsetsOpt =>
      hdfsAllOffsetsOpt.flatMap { hdfsAllOffsets =>
        val kafkaParameters = kafkaParametersOpt.get
        hdfsAllOffsets.get(kafkaParameters._1) match {
          case Some(v) => Some(v)
          case None =>
            logger.warn(s"Could not find offsets for topic ${kafkaParameters._1} in hdfs offsets ${hdfsAllOffsets}")
            None
        }
      }
    }
  }

  private def parseConfiguration(settings: Array[String]): Configuration = {
    val configuration = new BasicConfigurationBuilder[BaseConfiguration](classOf[BaseConfiguration])
      .configure(
        new Parameters()
          .basic()
          .setListDelimiterHandler(new DefaultListDelimiterHandler(ListDelimiter))
      )
      .getConfiguration

    settings.foreach(setOrThrow(_, configuration))
    configuration
  }

  private def setOrThrow(setting: String, configuration: Configuration): Unit = {
    if (!setting.contains(PropertyDelimiter)) {
      throw new IllegalArgumentException(s"Invalid setting format: $setting")
    } else {
      val settingKeyValue = setting.split(PropertyDelimiter, 2)
      configuration.setProperty(settingKeyValue(0).trim, settingKeyValue(1).trim)
    }
  }

  private def offsetsEqual(offsets1: Map[Int, Long], offsets2: Map[Int, Long]) = {
    offsets1.keySet == offsets2.keySet &&
    offsets1.forall { case (partition, offset1) =>
      offset1 == offsets2(partition)
    }
  }

  private def offsetsConsumed(checkpointOffsets: Map[Int, Long], kafkaOffsets: Map[Int, Long]) = {
    val isSamePartitions = kafkaOffsets.keySet == checkpointOffsets.keySet
    isSamePartitions && kafkaOffsets.nonEmpty && kafkaOffsets.forall { case (partition, kafkaPartitionOffset) =>
      checkpointOffsets(partition) == kafkaPartitionOffset
    }
  }
}