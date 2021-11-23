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

import org.apache.kafka.clients.admin.{AdminClient, DescribeTopicsOptions}
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.common.errors.UnknownTopicOrPartitionException
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.configuration.application.KafkaConfig
import za.co.absa.hyperdrive.trigger.models.errors.{ApiException, GenericError}

import java.util.Arrays.asList
import scala.concurrent.{ExecutionContext, Future}
import collection.JavaConversions._
import scala.util.{Failure, Success, Try}

trait KafkaService {
  def existsTopic(kafkaTopicName: String, servers: Seq[String])(implicit ec: ExecutionContext): Future[Boolean]
}

@Service
class KafkaServiceImpl(val kafkaConfig: KafkaConfig) extends KafkaService {
  private val serviceLogger = LoggerFactory.getLogger(this.getClass)

  override def existsTopic(kafkaTopicName: String, servers: Seq[String])(implicit ec: ExecutionContext): Future[Boolean] = {
    def closeAdminClient(adminClient: AdminClient): Unit = if (adminClient != null) adminClient.close()

    val properties = kafkaConfig.properties
    properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, servers.mkString(","))
    var adminClient: AdminClient = null
    Future {
      Try {
        adminClient = AdminClient.create(properties)
        adminClient.describeTopics(
          asList(kafkaTopicName), new DescribeTopicsOptions().timeoutMs(kafkaConfig.connectionTimeoutMillis)
        ).all().get()
      } match {
        case Success(topics) =>
          closeAdminClient(adminClient)
          topics.exists(_._2.name() == kafkaTopicName)
        case Failure(exception) => exception.getCause match {
          case _: UnknownTopicOrPartitionException =>
            closeAdminClient(adminClient)
            false
          case _ =>
            closeAdminClient(adminClient)
            serviceLogger.error(s"Unexpected error occurred checking kafka topic = $kafkaTopicName, servers = $servers", exception)
            throw new ApiException(GenericError("Unexpected error occurred while connecting to kafka brokers"))
        }
      }
    }
  }
}
