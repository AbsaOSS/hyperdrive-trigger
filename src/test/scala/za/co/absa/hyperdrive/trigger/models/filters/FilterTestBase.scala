
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

import java.time.LocalDateTime

import slick.lifted.ProvenShape
import za.co.absa.hyperdrive.trigger.persistance.RepositoryTestBase

trait FilterTestBase extends RepositoryTestBase {

  import h2Profile.api._

  case class FilterTestEntity(longValue: Long,
                              stringValue: String,
                              stringValue2: String,
                              stringValue3: String,
                              localDateTimeValue: LocalDateTime
                             )

  object FilterTestTableFieldNames {
    val longField = "longField"
    val stringField = "stringField"
    val stringField2 = "stringField2"
    val stringField3 = "stringField3"
    val localDateTimeField = "localDateTimeField"
  }

  final class FilterTestTable(tag: Tag) extends Table[FilterTestEntity](tag, _tableName = "test_entity") with FilteredTable {
    def longField: Rep[Long] = column[Long]("long_field")

    def stringField: Rep[String] = column[String]("string_field")

    def stringField2: Rep[String] = column[String]("string_field_2")

    def stringField3: Rep[String] = column[String]("string_field_3")

    def localDateTimeField: Rep[LocalDateTime] = column[LocalDateTime]("local_date_time_field")

    override def * : ProvenShape[FilterTestEntity] = (longField, stringField, stringField2, stringField3, localDateTimeField).mapTo[FilterTestEntity]

    override def jdbcProfile = h2Profile

    override def fieldMapping: Map[String, Rep[_]] = Map(
      FilterTestTableFieldNames.longField -> longField,
      FilterTestTableFieldNames.stringField -> stringField,
      FilterTestTableFieldNames.stringField2 -> stringField2,
      FilterTestTableFieldNames.stringField3 -> stringField3,
      FilterTestTableFieldNames.localDateTimeField -> localDateTimeField
    )
  }

  lazy val filterTestTable = TableQuery[FilterTestTable]

  def createSchema(): Unit = run(filterTestTable.schema.create)

  def dropSchema(): Unit = run(filterTestTable.schema.drop)

  def dropTable(): Unit = run(filterTestTable.delete)

  def createFilterTestData(): Unit = {
    run(filterTestTable.forceInsertAll(FilterTestData.filterTestEntities))
  }

  object FilterTestData {
    val t1 = FilterTestEntity(longValue = 1, stringValue = "value1", stringValue2 = "str1", stringValue3 = "bar",
      localDateTimeValue = LocalDateTime.of(2020, 3, 1, 12, 30, 5))
    val t2 = FilterTestEntity(longValue = 2, stringValue = "value2", stringValue2 = "str2", stringValue3 = "bar",
      localDateTimeValue = LocalDateTime.of(2005, 3, 1, 12, 30, 5))
    val t3 = FilterTestEntity(longValue = 3, stringValue = "value3", stringValue2 = "str3", stringValue3 = "foo",
      localDateTimeValue = LocalDateTime.of(2025, 3, 1, 12, 30, 5))
    val filterTestEntities: Seq[FilterTestEntity] = Seq(t1, t2, t3)
  }

}
