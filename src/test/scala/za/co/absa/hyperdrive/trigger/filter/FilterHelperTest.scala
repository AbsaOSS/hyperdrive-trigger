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

package za.co.absa.hyperdrive.trigger.filter

import java.time.LocalDateTime

import org.scalatest.{FlatSpec, _}
import za.co.absa.hyperdrive.trigger.filters.FilterHelper
import za.co.absa.hyperdrive.trigger.models.filters.{ContainsFilter, ContainsFilterAttributes, DateTimeRangeFilterAttributes, FilterAttributes, FilterSearchRequest, IntRangeFilterAttributes, StringEqualsFilterAttributes}
class FilterHelperTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with FilterTestBase {
  import h2Profile.api._

  behavior of ContainsFilter.getClass.getName

  override def beforeAll: Unit = {
    createSchema()
  }

  override def afterAll: Unit = {
    dropSchema()
  }

  override def afterEach: Unit = {
    dropTable()
  }

  it should "add all filters to the query" in {
    createFilterTestData()
    import FilterTestTableFieldNames._
    val stringEqualsFilterSeq = Seq(StringEqualsFilterAttributes(field = stringField3, value = "bar"))
    val containsFilterSeq = Seq(
      ContainsFilterAttributes(field = stringField, value = "value"),
      ContainsFilterAttributes(field = stringField2, value = "str")
    )
    val intRangeFilterSeq = Seq(IntRangeFilterAttributes(field = longField, start = 0, end = 1))
    val dateTimeRangeFilterSeq = Seq(DateTimeRangeFilterAttributes(field = localDateTimeField,
      start = LocalDateTime.of(2019, 1, 1, 1, 1, 1),
      end = LocalDateTime.of(2021, 1, 1, 1, 1, 1)))


    val filterSearchRequest = new FilterSearchRequest {
      override val stringEqualsFilters: Seq[StringEqualsFilterAttributes] = stringEqualsFilterSeq
      override val containsFilters: Seq[ContainsFilterAttributes] = containsFilterSeq
      override val intRangeFilters: Seq[IntRangeFilterAttributes] = intRangeFilterSeq
      override val dateTimeRangeFilters: Seq[DateTimeRangeFilterAttributes] = dateTimeRangeFilterSeq
    }

    val query = FilterHelper.addFiltersToQuery(filterTestTable, filterSearchRequest)
    val result = await(db.run(query.result))

    result should not be empty
    result should contain theSameElementsAs Seq(FilterTestData.t1)
  }
}
