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

import org.scalatest.{FlatSpec, _}
import za.co.absa.hyperdrive.trigger.models.search
import za.co.absa.hyperdrive.trigger.models.search._

import scala.concurrent.ExecutionContext.Implicits.global

class SearchableTableQueryTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with TestSearchableRepositoryTestBase {

  behavior of "SearchableTableQuery"

  val underTest = testSearchableTable

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
    import TestSearchableTableFieldNames._
    val stringEqualsFilterSeq = Some(Seq(StringEqualsFilterAttributes(field = stringField3, value = "bar")))
    val containsFilterSeq = Some(Seq(
      ContainsFilterAttributes(field = stringField, value = "value"),
      ContainsFilterAttributes(field = stringField2, value = "str")
    ))
    val intRangeFilterSeq = Some(Seq(IntRangeFilterAttributes(field = longField, start = 0, end = 1)))
    val dateTimeRangeFilterSeq = Some(Seq(DateTimeRangeFilterAttributes(field = localDateTimeField,
      start = LocalDateTime.of(2019, 1, 1, 1, 1, 1),
      end = LocalDateTime.of(2021, 1, 1, 1, 1, 1))))


    val searchRequest = TableSearchRequest(
      stringEqualsFilterAttributes = stringEqualsFilterSeq,
      containsFilterAttributes = containsFilterSeq,
      intRangeFilterAttributes = intRangeFilterSeq,
      dateTimeRangeFilterAttributes = dateTimeRangeFilterSeq,
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    result.total shouldBe 1
    result.items should contain theSameElementsAs Seq(TestSearchableData.t1)
  }

  "The contains filter" should "find values that contain the search string" in {
    createFilterTestData()
    val filter = ContainsFilterAttributes(field = TestSearchableTableFieldNames.stringField, value = "value")
    val searchRequest = TableSearchRequest(
      containsFilterAttributes = Some(Seq(filter)),
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    result.total should be > 0
    result.items should contain theSameElementsAs TestSearchableData.testSearchableEntities.filter(_.stringValue.contains("value"))
  }

  it should "not find values that do not contain the search string" in {
    createFilterTestData()
    val filter = ContainsFilterAttributes(field = TestSearchableTableFieldNames.stringField, value = "not-matching-string")
    val searchRequest = TableSearchRequest(
      containsFilterAttributes = Some(Seq(filter)),
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    result.total shouldBe 0
  }


  "The string-equals filter" should "find values exactly equal to the search string" in {
    createFilterTestData()
    val filter = StringEqualsFilterAttributes(field = TestSearchableTableFieldNames.stringField, value = "value2")
    val searchRequest = TableSearchRequest(
      stringEqualsFilterAttributes = Some(Seq(filter)),
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    result.total should be > 0
    result.items should contain theSameElementsAs TestSearchableData.testSearchableEntities.filter(_.stringValue == "value2")
  }

  it should "not find values different to the search string" in {
    createFilterTestData()
    val filter = StringEqualsFilterAttributes(field = TestSearchableTableFieldNames.stringField, value = "val")
    val searchRequest = TableSearchRequest(
      stringEqualsFilterAttributes = Some(Seq(filter)),
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    result.total shouldBe 0
  }


  "the date-time-range filter" should "find values within the inclusive range" in {
    createFilterTestData()
    val startDate = LocalDateTime.of(2020, 3, 1, 0, 0, 0)
    val endDate = LocalDateTime.of(2030, 1, 1, 0, 0, 0)
    val filter = DateTimeRangeFilterAttributes(field = TestSearchableTableFieldNames.localDateTimeField,
      start = startDate, end = endDate)
    val searchRequest = TableSearchRequest(
      dateTimeRangeFilterAttributes = Some(Seq(filter)),
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    result.total should be > 0
    result.items should contain theSameElementsAs Seq(TestSearchableData.t1, TestSearchableData.t3)
  }

  it should "return an empty list if start is higher than end" in {
    createFilterTestData()
    val startDate = LocalDateTime.of(2030, 1, 1, 0, 0, 0)
    val endDate = LocalDateTime.of(2020, 3, 1, 0, 0, 0)
    val filter = search.DateTimeRangeFilterAttributes(field = TestSearchableTableFieldNames.localDateTimeField, start = startDate, end = endDate)
    val searchRequest = TableSearchRequest(
      dateTimeRangeFilterAttributes = Some(Seq(filter)),
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    result.total shouldBe 0
  }


  "the int-range filter" should "find values within the inclusive range" in {
    createFilterTestData()
    val filter = IntRangeFilterAttributes(field = TestSearchableTableFieldNames.longField, start = 0, end = 2)
    val searchRequest = TableSearchRequest(
      intRangeFilterAttributes = Some(Seq(filter)),
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    result.total should be > 0
    result.items should contain theSameElementsAs TestSearchableData.testSearchableEntities.filter(e => e.longValue >= 0 && e.longValue <= 2)
  }

  it should "return an empty list if start is higher than end" in {
    createFilterTestData()
    val filter = IntRangeFilterAttributes(field = TestSearchableTableFieldNames.longField, start = 10, end = 0)
    val searchRequest = TableSearchRequest(
      intRangeFilterAttributes = Some(Seq(filter)),
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    result.total shouldBe 0
  }
}
