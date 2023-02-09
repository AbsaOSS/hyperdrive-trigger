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

import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.models.KafkaTopicAuthorizationResponse
import za.co.absa.hyperdrive.trigger.api.rest.services.clients.ConfluentClient
import za.co.absa.hyperdrive.trigger.configuration.application.ConfluentConfig
import za.co.absa.hyperdrive.trigger.models.confluent.{PatternType, ResourceType, RoleBinding, RoleName}

import scala.concurrent.{ExecutionContext, Future}

trait ConfluentService {
  val confluentClient: ConfluentClient
  def getKafkaTopicAuthorizations(kafkaTopic: String)(
    implicit ec: ExecutionContext
  ): Future[KafkaTopicAuthorizationResponse]
}

@Service
class ConfluentServiceImpl(override val confluentClient: ConfluentClient, confluentConfig: ConfluentConfig)
    extends ConfluentService {

  override def getKafkaTopicAuthorizations(
    kafkaTopic: String
  )(implicit ec: ExecutionContext): Future[KafkaTopicAuthorizationResponse] = {
    confluentClient.topicExists(kafkaTopic, confluentConfig.kafkaClusterId).flatMap {
      case true =>
        confluentClient.getRoleBindings(confluentConfig.user, confluentConfig.clusterType).map { roleBindings =>
          val topicBindings = roleBindings.filter(_.resourceType == ResourceType.Topic.name)

          def existsConditions: RoleBinding => Boolean = {
            case rb if rb.patternType == PatternType.Literal.name && rb.name == "*" => true
            case rb if rb.patternType == PatternType.Literal.name                   => rb.name == kafkaTopic
            case rb if rb.patternType == PatternType.Prefixed.name                  => kafkaTopic.startsWith(rb.name)
          }

          val hasReadAccess = topicBindings.filter(_.roleName == RoleName.DeveloperRead.name).exists(existsConditions)
          val hasWriteAccess = topicBindings.filter(_.roleName == RoleName.DeveloperWrite.name).exists(existsConditions)

          KafkaTopicAuthorizationResponse(exists = true, hasReadAccess = hasReadAccess, hasWriteAccess = hasWriteAccess)
        }
      case false =>
        Future.successful(
          KafkaTopicAuthorizationResponse(exists = false, hasReadAccess = false, hasWriteAccess = false)
        )
    }
  }

}
