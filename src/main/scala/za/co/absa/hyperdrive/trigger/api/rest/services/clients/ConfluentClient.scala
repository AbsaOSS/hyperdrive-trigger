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

import za.co.absa.hyperdrive.trigger.api.rest.client.{ApiCaller, NotFoundException, RestClient}
import za.co.absa.hyperdrive.trigger.models.confluent.RoleBinding

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

class ConfluentClient(private[services] val apiCaller: ApiCaller, private[services] val restClient: RestClient) {

  def getRoleBindings(user: String, clusterType: String)(implicit ec: ExecutionContext): Future[Seq[RoleBinding]] =
    Future(apiCaller.call { apiBaseUrl =>
      val url =
        s"$apiBaseUrl/api/metadata/security/1.0/lookup/rolebindings/principal/User:$user?clusterType=$clusterType"
      restClient.sendGet[Seq[RoleBinding]](url)
    })

  def topicExists(topic: String, kafkaClusterId: String)(implicit ec: ExecutionContext): Future[Boolean] = Future(
    apiCaller.call { apiBaseUrl =>
      val url = s"$apiBaseUrl/2.0/kafka/$kafkaClusterId/topics/$topic"
      Try(restClient.sendGet[Unit](url)) match {
        case Failure(_: NotFoundException) => false
        case Success(_)                    => true
      }
    }
  )
}
