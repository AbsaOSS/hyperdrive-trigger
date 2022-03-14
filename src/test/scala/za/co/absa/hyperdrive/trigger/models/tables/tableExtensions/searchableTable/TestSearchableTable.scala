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

package za.co.absa.hyperdrive.trigger.models.tables.tableExtensions.searchableTable

import slick.lifted.ProvenShape
import za.co.absa.hyperdrive.trigger.models.tables.{JdbcTypeMapper, Profile}

import java.time.LocalDateTime

trait TestSearchableTable extends SearchableTableQuery {
  this: Profile with JdbcTypeMapper =>

  import api._

  case class TestSearchableEntity(longValue: Long,
                                  stringValue: String,
                                  stringValue2: String,
                                  stringValue3: String,
                                  localDateTimeValue: LocalDateTime,
                                  booleanValue: Boolean
                                 )

  object TestSearchableTableFieldNames {
    val longField = "longField"
    val stringField = "stringField"
    val stringField2 = "stringField2"
    val stringField3 = "stringField3"
    val localDateTimeField = "localDateTimeField"
    val booleanField = "booleanField"
  }

  final class TestSearchableTable(tag: Tag) extends Table[TestSearchableEntity](tag, _tableName = "test_searchable_entity") with SearchableTable {
    def longField: Rep[Long] = column[Long]("long_field")

    def stringField: Rep[String] = column[String]("string_field")

    def stringField2: Rep[String] = column[String]("string_field_2")

    def stringField3: Rep[String] = column[String]("string_field_3")

    def localDateTimeField: Rep[LocalDateTime] = column[LocalDateTime]("local_date_time_field")

    def booleanField: Rep[Boolean] = column[Boolean]("boolean_field")

    override def * : ProvenShape[TestSearchableEntity] = (longField, stringField, stringField2, stringField3, localDateTimeField, booleanField).mapTo[TestSearchableEntity]

    override def fieldMapping: Map[String, Rep[_]] = Map(
      TestSearchableTableFieldNames.longField -> longField,
      TestSearchableTableFieldNames.stringField -> stringField,
      TestSearchableTableFieldNames.stringField2 -> stringField2,
      TestSearchableTableFieldNames.stringField3 -> stringField3,
      TestSearchableTableFieldNames.localDateTimeField -> localDateTimeField,
      TestSearchableTableFieldNames.booleanField -> booleanField
    )

    override def defaultSortColumn: Rep[_] = longField
  }

  lazy val testSearchableTable = TableQuery[TestSearchableTable]

}
