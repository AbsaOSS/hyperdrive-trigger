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

package za.co.absa.hyperdrive.trigger.api.rest.services.clients

import org.mockito.ArgumentMatchers._
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers}
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.api.rest.client.{ApiCaller, RestClient}
import za.co.absa.hyperdrive.trigger.models.confluent.RoleBinding

import scala.concurrent.ExecutionContext

class ConfluentClientTest extends AsyncFlatSpec with Matchers with MockitoSugar with BeforeAndAfter {
  override implicit def executionContext: ExecutionContext = scala.concurrent.ExecutionContext.Implicits.global

  private val apiCallerMock = mock[ApiCaller]
  private val restClientMock = mock[RestClient]

  private val user = "user"
  private val topic = "topic"
  private val clusterType = "clusterType"
  private val clusterId = "clusterId"

  private val underTest = new ConfluentClient(apiCallerMock, restClientMock)

  before {
    reset(apiCallerMock)
    reset(restClientMock)
  }

  "ConfluentClient.getRoleBindings" should "return role bindings" in {
    when(apiCallerMock.call(any())).thenReturn(Seq.empty[RoleBinding])
    val result = await(underTest.getRoleBindings(user, clusterType))

    result shouldBe Seq.empty[RoleBinding]
  }

  "ConfluentClient.topicExists" should "return true if topic exists" in {
    when(apiCallerMock.call(any())).thenReturn(true)
    val result = await(underTest.topicExists(topic, clusterId))

    result shouldBe true
  }

  "ConfluentClient.topicExists" should "return false if topic does not exist" in {
    when(apiCallerMock.call(any())).thenReturn(false)
    val result = await(underTest.topicExists(topic, clusterId))

    result shouldBe false
  }

}
