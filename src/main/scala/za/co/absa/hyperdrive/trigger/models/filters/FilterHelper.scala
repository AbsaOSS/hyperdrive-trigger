
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

package za.co.absa.hyperdrive.trigger.models.filters

import slick.lifted.{AbstractTable, Query, TableQuery}

object FilterHelper {
  def addFiltersToQuery[T <: AbstractTable[_] with FilteredTable](tableQuery: TableQuery[T], request: FilterSearchRequest): Query[T, T#TableElementType, Seq] = {
    val initQuery: Query[T, T#TableElementType, Seq] = tableQuery
    val withStringEquals = request.getStringEqualsFilterAttributes.foldLeft(initQuery)((query, attributes) =>
      query.filter(table => table.applyStringEqualsFilter(attributes)))
    val withContains = request.getContainsFilterAttributes.foldLeft(withStringEquals)((query, attributes) =>
      query.filter(table => table.applyContainsFilter(attributes)))
    val withIntRange = request.getIntRangeFilterAttributes.foldLeft(withContains)((query, attributes) =>
      query.filter(table => table.applyIntRangeFilter(attributes)))
    val withDateTimeRange = request.getDateTimeRangeFilterAttributes.foldLeft(withIntRange)((query, attributes) =>
      query.filter(table => table.applyDateTimeRangeFilter(attributes)))

    withDateTimeRange
  }
}
