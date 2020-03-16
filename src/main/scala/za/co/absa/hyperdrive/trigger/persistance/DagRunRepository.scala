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
import slick.dbio.Effect
import slick.sql.{FixedSqlAction, FixedSqlStreamingAction}
import za.co.absa.hyperdrive.trigger.models.dagRuns.{DagRun, DagRunsSearchRequest, DagRunsSearchResponse, Filters, RangeFilters}

import scala.concurrent.{ExecutionContext, Future}

trait DagRunRepository extends Repository {
  def searchDagRuns(dagRunsSearchRequest: DagRunsSearchRequest)(implicit ec: ExecutionContext): Future[DagRunsSearchResponse]
}

@stereotype.Repository
class DagRunRepositoryImpl extends DagRunRepository {
  import profile.api._

  override def searchDagRuns(dagRunsSearchRequest: DagRunsSearchRequest)(implicit ec: ExecutionContext): Future[DagRunsSearchResponse] = {
    val definedFilters = dagRunsSearchRequest.filters.getOrElse(Filters(None, None, None))
    val definedRangeFilters = dagRunsSearchRequest.rangeFilters.getOrElse(RangeFilters(None, None, None))
    val filteredQuery = dagRunTable
      .filterOpt(definedFilters.byWorkflowName)((table, value) =>
        table.workflowName like s"%${value}%")
      .filterOpt(definedFilters.byProjectName)((table, value) =>
        table.projectName like s"%${value}%")
      .filterOpt(definedFilters.byStatus)((table, value) =>
        table.status === value)
      .filterOpt(definedRangeFilters.byJobCount)((table, value) =>
        table.jobCount >= value.start && table.jobCount <= value.end)
      .filterOpt(definedRangeFilters.byStartedDate)((table, value) =>
        table.started >= value.start && table.started <= value.end)
      .filterOpt(definedRangeFilters.byFinishedDate)((table, value) =>
        table.finished >= value.start && table.finished <= value.end)

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
