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
import za.co.absa.hyperdrive.trigger.models.dagRuns.DagRun
import za.co.absa.hyperdrive.trigger.models.search.{TableSearchRequest, TableSearchResponse}
import za.co.absa.hyperdrive.trigger.persistance.DagRunRepository

import scala.concurrent.{ExecutionContext, Future}

trait DagRunService {
  val dagRunRepository: DagRunRepository
  def searchDagRuns(searchRequest: TableSearchRequest)(implicit ec: ExecutionContext): Future[TableSearchResponse[DagRun]]
}

@Service
class DagRunServiceImpl(override val dagRunRepository: DagRunRepository) extends DagRunService {

  override def searchDagRuns(searchRequest: TableSearchRequest)(implicit ec: ExecutionContext): Future[TableSearchResponse[DagRun]] = {
    dagRunRepository.searchDagRuns(searchRequest)
  }

}
