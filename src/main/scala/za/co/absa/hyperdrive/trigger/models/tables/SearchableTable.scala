
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

package za.co.absa.hyperdrive.trigger.models.tables

import slick.jdbc.JdbcProfile
import slick.lifted.{ColumnOrdered, Rep}
import za.co.absa.hyperdrive.trigger.models.filters._
import za.co.absa.hyperdrive.trigger.models.search.Sort

trait SearchableTable {
  def jdbcProfile: JdbcProfile
  def fieldMapping: Map[String, Rep[_]]
  def defaultSortColumn: Rep[_]
  def applyContainsFilter(attributes: ContainsFilterAttributes): Rep[Boolean] =
    ContainsFilter(attributes, fieldMapping, jdbcProfile)
  def applyStringEqualsFilter(attributes: StringEqualsFilterAttributes): Rep[Boolean] =
    StringEqualsFilter(attributes, fieldMapping, jdbcProfile)
  def applyIntRangeFilter(attributes: IntRangeFilterAttributes): Rep[Boolean] =
    IntRangeFilter(attributes, fieldMapping, jdbcProfile)
  def applyDateTimeRangeFilter(attributes: DateTimeRangeFilterAttributes): Rep[Boolean] =
    DateTimeRangeFilter(attributes, fieldMapping, jdbcProfile)

  def sortFields(sortOpt: Option[Sort]): ColumnOrdered[_] = {
    val sortParameters = sortOpt match {
      case Some(sort) => (fieldMapping(sort.by), sort.order)
      case None => (defaultSortColumn, 1)
    }

    val ordering: slick.ast.Ordering.Direction = if (sortParameters._2 == -1) slick.ast.Ordering.Desc else slick.ast.Ordering.Asc
    ColumnOrdered(sortParameters._1, slick.ast.Ordering(ordering))
  }

}
