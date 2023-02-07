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

package za.co.absa.hyperdrive.trigger.api.rest.services.client

import za.co.absa.hyperdrive.trigger.api.rest.client.{ApiCaller, RestClient}
import za.co.absa.hyperdrive.trigger.models.VersionedDataset

import scala.concurrent.{ExecutionContext, Future}

class MenasClient(private[services] val apiCaller: ApiCaller, private[services] val restClient: RestClient) {

  def authenticate(): Unit =
    restClient.authenticate()

  def listVersionedDatasets(searchQuery: Option[String])(implicit ec: ExecutionContext): Future[Seq[VersionedDataset]] =
    Future(apiCaller.call { apiBaseUrl =>
      val searchSegment = searchQuery.fold("")(query => s"/$query")
      val url           = s"$apiBaseUrl/menas/api/dataset/list$searchSegment"
      restClient.sendGet[Seq[VersionedDataset]](url)
    })
}
