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

import java.time.LocalDateTime

import slick.lifted.{AbstractTable, ColumnOrdered}
import za.co.absa.hyperdrive.trigger.models.search.{ContainsFilterAttributes, DateTimeRangeFilterAttributes, IntRangeFilterAttributes, SortAttributes, StringEqualsFilterAttributes, TableSearchRequest, TableSearchResponse}

import scala.concurrent.ExecutionContext

trait SearchableTableQuery {
  this: Profile with JdbcTypeMapper =>

  import profile.api._

  implicit class TableQueryExtension[T <: SearchableTable with AbstractTable[_]](tableQuery: TableQuery[T]) {

    def search(request: TableSearchRequest)(implicit ec: ExecutionContext): DBIOAction[TableSearchResponse[T#TableElementType], NoStream, Effect.Read] = {
      val initQuery: Query[T, T#TableElementType, Seq] = tableQuery

      val withStringEquals = request.getStringEqualsFilterAttributes.foldLeft(initQuery)((query, attributes) =>
        query.filter(table => applyStringEqualsFilter(attributes, table.fieldMapping)))
      val withContains = request.getContainsFilterAttributes.foldLeft(withStringEquals)((query, attributes) =>
        query.filter(table => applyContainsFilter(attributes, table.fieldMapping)))
      val withIntRange = request.getIntRangeFilterAttributes.foldLeft(withContains)((query, attributes) =>
        query.filter(table => applyIntRangeFilter(attributes, table.fieldMapping)))
      val filteredQuery = request.getDateTimeRangeFilterAttributes.foldLeft(withIntRange)((query, attributes) =>
        query.filter(table => applyDateTimeRangeFilter(attributes, table.fieldMapping)))

      val length = filteredQuery.length.result

      val result = filteredQuery
        .sortBy(table => sortFields(request.sort, table.fieldMapping, table.defaultSortColumn))
        .drop(request.from)
        .take(request.size).result

      for {
        l <- length
        r <- result
      } yield {
        TableSearchResponse[T#TableElementType](items = r, total = l)
      }
    }

    private def applyContainsFilter(attributes: ContainsFilterAttributes, fieldMapping: Map[String, Rep[_]]): Rep[Boolean] = {
      val tableField = fieldMapping(attributes.field).asInstanceOf[Rep[String]]
      tableField like s"%${attributes.value}%"
    }

    private def applyStringEqualsFilter(attributes: StringEqualsFilterAttributes, fieldMapping: Map[String, Rep[_]]): Rep[Boolean] = {
      val tableField = fieldMapping(attributes.field).asInstanceOf[Rep[String]]
      tableField === attributes.value
    }

    private def applyIntRangeFilter(attributes: IntRangeFilterAttributes, fieldMapping: Map[String, Rep[_]]): Rep[Boolean] = {
      val tableField = fieldMapping(attributes.field).asInstanceOf[Rep[Int]]
      attributes.start.map(date => tableField >= date).getOrElse(LiteralColumn(true)) &&
        attributes.end.map(date => tableField <= date).getOrElse(LiteralColumn(true))
    }

    private def applyDateTimeRangeFilter(attributes: DateTimeRangeFilterAttributes, fieldMapping: Map[String, Rep[_]]): Rep[Boolean] = {
      val tableField = fieldMapping(attributes.field).asInstanceOf[Rep[LocalDateTime]]
      attributes.start.map(date => tableField >= date).getOrElse(LiteralColumn(true)) &&
        attributes.end.map(date => tableField <= date).getOrElse(LiteralColumn(true))
    }

    private def sortFields(sortOpt: Option[SortAttributes], fieldMapping: Map[String, Rep[_]], defaultSortColumn: Rep[_]): ColumnOrdered[_] = {
      val sortParameters = sortOpt match {
        case Some(sort) => (fieldMapping(sort.by), sort.order)
        case None => (defaultSortColumn, 1)
      }

      val ordering: slick.ast.Ordering.Direction = if (sortParameters._2 == -1) slick.ast.Ordering.Desc else slick.ast.Ordering.Asc
      ColumnOrdered(sortParameters._1, slick.ast.Ordering(ordering))
    }

  }

}
