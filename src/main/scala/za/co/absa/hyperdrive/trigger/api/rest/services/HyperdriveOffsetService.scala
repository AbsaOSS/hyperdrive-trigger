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
import org.apache.hadoop.security.UserGroupInformation
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.configuration.application.SparkConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.models.{JobInstanceParameters, SparkInstanceParameters}

import java.util.Properties
import javax.inject.Inject
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

trait HyperdriveOffsetService {
  def isNewJobInstanceRequired(jobParameters: JobInstanceParameters)(implicit ec: ExecutionContext): Future[Boolean]

  def getNumberOfMessagesLeft(jobParameters: JobInstanceParameters)(
    implicit ec: ExecutionContext
  ): Future[Option[(String, Map[Int, Long])]]
}

@Service
@Lazy
class HyperdriveOffsetServiceImpl @Inject() (sparkConfig: SparkConfig,
                                             @Lazy checkpointService: CheckpointService,
                                             @Lazy userGroupInformationService: UserGroupInformationService,
                                             kafkaService: KafkaService
) extends HyperdriveOffsetService {
  private val logger = LoggerFactory.getLogger(this.getClass)
  private val HyperdriveCheckpointKey = "writer.common.checkpoint.location"
  private val HyperdriveKafkaTopicKey = "reader.kafka.topic"
  private val HyperdriveKafkaBrokersKey = "reader.kafka.brokers"
  private val HyperdriveKafkaExtraOptionsKey = "reader.option.kafka"
  private val PropertyDelimiter = "="
  private val ListDelimiter = ','
  private val defaultDeserializer = "org.apache.kafka.common.serialization.StringDeserializer"

  /**
   *  @param jobParameters Parameters for the job instance. Should contain at least
   *                      - reader.kafka.topic
   *                      - reader.kafka.brokers
   *                      - writer.common.checkpoint.location
   *  @param ec            ExecutionContext
   *  @return - number not ingested messages.
   */
  def getNumberOfMessagesLeft(
    jobParameters: JobInstanceParameters
  )(implicit ec: ExecutionContext): Future[Option[(String, Map[Int, Long])]] = {
    val kafkaParametersOpt = getKafkaParameters(jobParameters)
    val hdfsParametersOpt: Option[HdfsParameters] = getResolvedAppArguments(jobParameters).flatMap(getHdfsParameters)

    if (kafkaParametersOpt.isEmpty) {
      logger.debug(s"Kafka parameters were not found in job definition $jobParameters")
    }

    Future(
      for {
        kafkaParameters <- kafkaParametersOpt
        hdfsParameters <- hdfsParametersOpt
      } yield {
        val kafkaOffsets = kafkaService.getOffsets(kafkaParameters._1, kafkaParameters._2)
        if (
          kafkaOffsets.beginningOffsets.isEmpty || kafkaOffsets.endOffsets.isEmpty || kafkaOffsets.beginningOffsets.keySet != kafkaOffsets.endOffsets.keySet
        ) {
          None
        } else {
          val ugi = userGroupInformationService.loginUserFromKeytab(hdfsParameters.principal, hdfsParameters.keytab)
          val hdfsOffsetsTry = checkpointService.getLatestCommittedOffset(hdfsParameters)(ugi)

          hdfsOffsetsTry match {
            case Failure(_) => None
            case Success(hdfsOffsetsOption) =>
              val messagesLeft = kafkaOffsets.beginningOffsets.map { case (partition, kafkaBeginningOffset) =>
                val kafkaEndOffset = kafkaOffsets.endOffsets(partition)
                val numberOfMessages = hdfsOffsetsOption.flatMap(_.get(partition)) match {
                  case Some(hdfsOffset) if hdfsOffset > kafkaEndOffset        => kafkaEndOffset - hdfsOffset
                  case Some(hdfsOffset) if hdfsOffset > kafkaBeginningOffset  => kafkaEndOffset - hdfsOffset
                  case Some(hdfsOffset) if hdfsOffset <= kafkaBeginningOffset => kafkaEndOffset - kafkaBeginningOffset
                  case None                                                   => kafkaEndOffset - kafkaBeginningOffset
                }
                partition -> numberOfMessages
              }
              Some((kafkaOffsets.topic, messagesLeft))
          }
        }
      }
    ).map(_.flatten)
  }

  /**
   *  @param jobParameters Parameters for the job instance. Should contain at least
   *                      - reader.kafka.topic
   *                      - reader.kafka.brokers
   *                      - writer.common.checkpoint.location
   *  @param ec ExecutionContext
   *  @return - false if the job instance can be skipped. This is determined if the checkpoint offset is equal
   *         to the latest offsets on the kafka topic. A job instance can also be skipped if the kafka topic doesn't exist
   *         or if it's empty.
   *         - true otherwise
   */
  def isNewJobInstanceRequired(jobParameters: JobInstanceParameters)(implicit ec: ExecutionContext): Future[Boolean] = {
    val kafkaParametersOpt = getKafkaParameters(jobParameters)
    if (kafkaParametersOpt.isEmpty) {
      logger.debug(s"Kafka parameters were not found in job definition $jobParameters")
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
          case (Some(kafkaBeginningOffsets), Some(kafkaEndOffsets)) if kafkaBeginningOffsets.nonEmpty =>
            if (offsetsEqual(kafkaBeginningOffsets, kafkaEndOffsets)) {
              logger.info(s"Topic ${kafkaParametersOpt.get._1} is empty. Skipping job instance")
              Future { false }
            } else {
              getCheckpointOffsets(jobParameters, kafkaParametersOpt).map {
                case Some(checkpointOffsets) =>
                  val allConsumed = offsetsConsumed(checkpointOffsets, kafkaEndOffsets)
                  if (allConsumed) {
                    logger.info(s"All offsets consumed for topic ${kafkaParametersOpt.get._1}. Skipping job instance")
                  } else {
                    logger.debug(
                      s"Some offsets haven't been consumed yet for topic ${kafkaParametersOpt.get._1}. Kafka offsets: $kafkaEndOffsets, " +
                        s"Checkpoint offsets: $checkpointOffsets"
                    )
                  }
                  !allConsumed
                case _ => true
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
      logger.warn(s"Job Parameters $jobParameters is not a Hyperdrive Job!")
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
        s"Could not extract hdfs parameters from spark config $sparkConfig" +
          s" and resolved app arguments $resolvedAppArguments"
      )
    }

    hdfsParameters
  }

  private def getKafkaParameters(jobParameters: JobInstanceParameters): Option[(String, Properties)] = {
    if (!isHyperdriveJob(jobParameters)) {
      logger.warn(s"Job Definition $jobParameters is not a Hyperdrive Job!")
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
        properties.setProperty(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, defaultDeserializer)
        properties.setProperty(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, defaultDeserializer)
        extraArgs.foreach { case (key, value) => properties.setProperty(key, value) }
        (topic, properties)
      }

      if (kafkaParameters.isEmpty) {
        logger.warn(
          s"Could not find required kafka parameters in job parameters $jobParameters with args $args"
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
    case class UGIOffset(ugi: UserGroupInformation, latestOffset: (String, Boolean))
    val hdfsParametersOpt: Option[HdfsParameters] = getResolvedAppArguments(jobParameters).flatMap(getHdfsParameters)

    if (hdfsParametersOpt.isEmpty) {
      logger.debug(s"Hdfs parameters were not found in job definition $jobParameters")
    }

    Future {
      val ugiOffset = for {
        hdfsParameters <- hdfsParametersOpt
        ugi = userGroupInformationService.loginUserFromKeytab(hdfsParameters.principal, hdfsParameters.keytab)
        latestOffset <- checkpointService.getLatestOffsetFilePath(hdfsParameters)(ugi).get
      } yield { UGIOffset(ugi, latestOffset) }
      if (ugiOffset.isEmpty || !ugiOffset.get.latestOffset._2) {
        logger.debug(s"Offset does not exist or is not committed ${ugiOffset.map(_.latestOffset)}")
        None
      } else {
        ugiOffset
      }
    }.flatMap {
      case None                                  => Future { None }
      case Some(_) if kafkaParametersOpt.isEmpty => Future { None }
      case Some(ugiOffset) =>
        Future
          .fromTry(checkpointService.getOffsetsFromFile(ugiOffset.latestOffset._1)(ugiOffset.ugi))
          .recover { case e: Exception =>
            logger.warn(s"Couldn't parse file ${ugiOffset.latestOffset._1}", e)
            None
          }
    }.map { hdfsAllOffsetsOpt =>
      hdfsAllOffsetsOpt.flatMap { hdfsAllOffsets =>
        val kafkaParameters = kafkaParametersOpt.get
        hdfsAllOffsets.get(kafkaParameters._1) match {
          case Some(v) => Some(v)
          case None =>
            logger.warn(s"Could not find offsets for topic ${kafkaParameters._1} in hdfs offsets $hdfsAllOffsets")
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
