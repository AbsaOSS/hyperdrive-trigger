
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

import net.manub.embeddedkafka.EmbeddedKafka.withRunningKafka
import net.manub.embeddedkafka.EmbeddedKafkaConfig
import org.apache.kafka.clients.admin.{AdminClient, NewTopic}
import org.apache.kafka.clients.producer.ProducerConfig
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.configuration.application.{KafkaConfig, TestKafkaConfig}
import za.co.absa.hyperdrive.trigger.models.errors.{ApiException, GenericError}

import java.util.Arrays.asList
import java.util.Properties
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class KafkaServiceTest extends FlatSpec with MockitoSugar with Matchers with BeforeAndAfter {
  private val kafkaPort = 12345
  private val kafkaUrl = s"localhost:${kafkaPort}"
  private val testKafkaConfig: KafkaConfig = TestKafkaConfig()
  private implicit val config: EmbeddedKafkaConfig = EmbeddedKafkaConfig(kafkaPort = kafkaPort, zooKeeperPort = 12346)

  "KafkaService.existsTopic" should "return true if topic exists" in {
    withRunningKafka {
      val testTopic = "testTopic"
      createTopic(testTopic)

      val underTest = new KafkaServiceImpl(testKafkaConfig)
      val result = await(underTest.existsTopic(testTopic, Seq(kafkaUrl)))

      result shouldBe true
    }
  }

  it should "return false if topic does not exist" in {
    withRunningKafka {
      val testTopic = "fakeTopic"

      val underTest = new KafkaServiceImpl(testKafkaConfig)
      val result = await(underTest.existsTopic(testTopic, Seq(kafkaUrl)))

      result shouldBe false
    }
  }

  it should "should throw exception if connection could not be established" in {
    withRunningKafka {
      val testTopic = "testTopic"
      val fakeKafkaUrl = "localhost:9999"
      createTopic(testTopic)

      val underTest = new KafkaServiceImpl(testKafkaConfig)

      val result = the[ApiException] thrownBy await(underTest.existsTopic(testTopic, Seq(fakeKafkaUrl)))

      result.apiErrors should have size 1
      result.apiErrors.head shouldBe GenericError("Could not establish connection.")
    }
  }


  private def createAdminClient(): AdminClient = {
    val properties = new Properties()
    properties.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaUrl)
    AdminClient.create(properties)
  }

  private def createTopic(topicName: String): Unit = {
    val adminClient: AdminClient = createAdminClient()
    val createTopicResponse = Future(
      adminClient.createTopics(asList(new NewTopic(topicName, 1, 1))).all().get()
    )
    await(createTopicResponse)
    adminClient.close()
  }
}
