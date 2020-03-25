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

package za.co.absa.hyperdrive.trigger.models.dagRuns

import za.co.absa.hyperdrive.trigger.models.filters.{ContainsFilterAttributes, DateTimeRangeFilterAttributes, FilterSearchRequest, IntRangeFilterAttributes, StringEqualsFilterAttributes}

case class DagRunsSearchRequest(
  override val stringEqualsFilterAttributes: Option[Seq[StringEqualsFilterAttributes]] = None,
  override val containsFilterAttributes: Option[Seq[ContainsFilterAttributes]] = None,
  override val intRangeFilterAttributes: Option[Seq[IntRangeFilterAttributes]] = None,
  override val dateTimeRangeFilterAttributes: Option[Seq[DateTimeRangeFilterAttributes]] = None,
  sort: Option[Sort],
  from: Int,
  size: Int
) extends FilterSearchRequest

case class Sort(
  by: String,
  order: Int
)