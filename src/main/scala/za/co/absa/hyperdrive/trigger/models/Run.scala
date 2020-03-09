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

package za.co.absa.hyperdrive.trigger.models

import java.time.LocalDateTime

import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses.DagInstanceStatus

case class Run(
  workflowName: String,
  projectName: String,
  jobCount: Int,
  started: LocalDateTime,
  finished: Option[LocalDateTime],
  status: String,
  id: Long = 0
)

case class RunSearchResult(
  runs: Seq[Run],
  total: Int
)

case class RunsSearchRequest(
  filters: Option[Filters],
  rangeFilters: Option[RangeFilters],
  sort: Option[Sort],
  from: Int,
  size: Int
)

case class Sort(
  by: String,
  order: Int
)

case class RangeFilters(
  byJobCount: Option[IntRange],
  byStartedDate: Option[DateTimeRange],
  byFinishedDate: Option[DateTimeRange]
)

case class IntRange(
  start: Int,
  end: Int
)

case class DateTimeRange(
  start: LocalDateTime,
  end: LocalDateTime
)

case class Filters(
  byWorkflowName: Option[String],
  byProjectName: Option[String],
  byStatus: Option[String]
)
