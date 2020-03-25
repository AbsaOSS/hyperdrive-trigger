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

package za.co.absa.hyperdrive.trigger.persistance

import org.springframework.stereotype
import za.co.absa.hyperdrive.trigger.models.filters.FilterHelper
import za.co.absa.hyperdrive.trigger.models.dagRuns.{DagRunsSearchRequest, DagRunsSearchResponse}

import scala.concurrent.{ExecutionContext, Future}

trait DagRunRepository extends Repository {
  def searchDagRuns(dagRunsSearchRequest: DagRunsSearchRequest)(implicit ec: ExecutionContext): Future[DagRunsSearchResponse]
}

@stereotype.Repository
class DagRunRepositoryImpl extends DagRunRepository {
  import profile.api._

  override def searchDagRuns(dagRunsSearchRequest: DagRunsSearchRequest)(implicit ec: ExecutionContext): Future[DagRunsSearchResponse] = {
    val filteredQuery = FilterHelper.addFiltersToQuery(dagRunTable, dagRunsSearchRequest)
    val length = filteredQuery.length.result
    val result = filteredQuery
      .sortBy(_.sortFields(dagRunsSearchRequest.sort))
      .drop(dagRunsSearchRequest.from)
      .take(dagRunsSearchRequest.size).result

    db.run {(
      for {
        l <- length
        r <- result
      } yield {
        DagRunsSearchResponse(runs = r, total = l)
      }
    )}
  }

}
