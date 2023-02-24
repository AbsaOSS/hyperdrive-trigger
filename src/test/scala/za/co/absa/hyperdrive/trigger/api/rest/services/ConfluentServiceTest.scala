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

import org.mockito.ArgumentMatchers.{eq => eqTo, _}
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers}
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.api.rest.services.clients.ConfluentClient
import za.co.absa.hyperdrive.trigger.configuration.application.ConfluentConfig
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.confluent.{PatternType, ResourceType, RoleBinding, RoleName}

import scala.concurrent.{ExecutionContext, Future}

class ConfluentServiceTest extends AsyncFlatSpec with Matchers with MockitoSugar with BeforeAndAfter {
  override implicit def executionContext: ExecutionContext = scala.concurrent.ExecutionContext.Implicits.global

  private val confluentClientMock = mock[ConfluentClient]
  private val confluentConfig = new ConfluentConfig(new Array[String](0), "authPath", "user", "base64", 1, "id", "type")
  private val topicName = "some.topic"
  private val topicPrefix = "some"
  private val underTest = new ConfluentServiceImpl(confluentClientMock, confluentConfig)

  before {
    reset(confluentClientMock)
  }

  "ConfluentService.getKafkaTopicAuthorizations" should "return topic does not exist if there is no such topic" in {
    when(confluentClientMock.topicExists(eqTo(topicName), eqTo(confluentConfig.kafkaClusterId))(any[ExecutionContext]))
      .thenReturn(Future(false))

    val result = await(underTest.getKafkaTopicAuthorizations(topicName))

    result shouldBe KafkaTopicAuthorizationResponse(exists = false, hasReadAccess = false, hasWriteAccess = false)
  }

  it should "return kafka topic exist with no authorizations if there is no authorization for the topic" in {
    when(confluentClientMock.topicExists(eqTo(topicName), eqTo(confluentConfig.kafkaClusterId))(any[ExecutionContext]))
      .thenReturn(Future(true))
    when(
      confluentClientMock.getRoleBindings(eqTo(confluentConfig.user), eqTo(confluentConfig.clusterType))(
        any[ExecutionContext]
      )
    )
      .thenReturn(Future(Seq.empty[RoleBinding]))

    val result = await(underTest.getKafkaTopicAuthorizations(topicName))

    result shouldBe KafkaTopicAuthorizationResponse(exists = true, hasReadAccess = false, hasWriteAccess = false)
  }

  it should "return kafka topic exist with read authorizations if there is only read authorization for the topic" in {
    when(confluentClientMock.topicExists(eqTo(topicName), eqTo(confluentConfig.kafkaClusterId))(any[ExecutionContext]))
      .thenReturn(Future(true))
    when(
      confluentClientMock.getRoleBindings(eqTo(confluentConfig.user), eqTo(confluentConfig.clusterType))(
        any[ExecutionContext]
      )
    )
      .thenReturn(
        Future(
          Seq(RoleBinding(ResourceType.Topic.name, topicName, PatternType.Literal.name, RoleName.DeveloperRead.name))
        )
      )
    val result = await(underTest.getKafkaTopicAuthorizations(topicName))

    result shouldBe KafkaTopicAuthorizationResponse(exists = true, hasReadAccess = true, hasWriteAccess = false)
  }

  it should "return kafka topic exist with read and write authorizations if there is such topic" in {
    when(confluentClientMock.topicExists(eqTo(topicName), eqTo(confluentConfig.kafkaClusterId))(any[ExecutionContext]))
      .thenReturn(Future(true))
    when(
      confluentClientMock.getRoleBindings(eqTo(confluentConfig.user), eqTo(confluentConfig.clusterType))(
        any[ExecutionContext]
      )
    )
      .thenReturn(
        Future(
          Seq(
            RoleBinding(ResourceType.Topic.name, topicName, PatternType.Literal.name, RoleName.DeveloperRead.name),
            RoleBinding(ResourceType.Topic.name, topicName, PatternType.Literal.name, RoleName.DeveloperWrite.name)
          )
        )
      )
    val result = await(underTest.getKafkaTopicAuthorizations(topicName))

    result shouldBe KafkaTopicAuthorizationResponse(exists = true, hasReadAccess = true, hasWriteAccess = true)
  }

  it should "return kafka topic exist with read authorizations if prefix is matched" in {
    when(confluentClientMock.topicExists(eqTo(topicName), eqTo(confluentConfig.kafkaClusterId))(any[ExecutionContext]))
      .thenReturn(Future(true))
    when(
      confluentClientMock.getRoleBindings(eqTo(confluentConfig.user), eqTo(confluentConfig.clusterType))(
        any[ExecutionContext]
      )
    )
      .thenReturn(
        Future(
          Seq(RoleBinding(ResourceType.Topic.name, topicName, PatternType.Prefixed.name, RoleName.DeveloperRead.name))
        )
      )
    val result = await(underTest.getKafkaTopicAuthorizations(topicName))

    result shouldBe KafkaTopicAuthorizationResponse(exists = true, hasReadAccess = true, hasWriteAccess = false)
  }

  it should "return kafka topic exist with read authorizations if binding with wildcard is used" in {
    when(confluentClientMock.topicExists(eqTo(topicName), eqTo(confluentConfig.kafkaClusterId))(any[ExecutionContext]))
      .thenReturn(Future(true))
    when(
      confluentClientMock.getRoleBindings(eqTo(confluentConfig.user), eqTo(confluentConfig.clusterType))(
        any[ExecutionContext]
      )
    )
      .thenReturn(
        Future(
          Seq(RoleBinding(ResourceType.Topic.name, "*", PatternType.Literal.name, RoleName.DeveloperRead.name))
        )
      )
    val result = await(underTest.getKafkaTopicAuthorizations(topicName))

    result shouldBe KafkaTopicAuthorizationResponse(exists = true, hasReadAccess = true, hasWriteAccess = false)
  }

  "ConfluentService.getKafkaTopicAuthorizations" should "throw exception if confluent client throws exception" in {
    val exception = new Exception("exception")
    when(confluentClientMock.topicExists(eqTo(topicName), eqTo(confluentConfig.kafkaClusterId))(any[ExecutionContext]))
      .thenReturn(Future.failed(exception))

    val result = the[Exception] thrownBy await(underTest.getKafkaTopicAuthorizations(topicName))

    result.getMessage should contain theSameElementsAs exception.getMessage
  }

}
