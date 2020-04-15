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

  override def beforeEach: Unit = {
    createFilterTestData()
  }

  override def afterEach: Unit = {
    dropTable()
  }

  it should "add all filters to the query" in {
    import TestSearchableTableFieldNames._
    val containsFilterSeq = Some(Seq(
      ContainsFilterAttributes(field = stringField, value = "value"),
      ContainsFilterAttributes(field = stringField2, value = "str")
    ))
    val intRangeFilterSeq = Some(Seq(IntRangeFilterAttributes(field = longField, start = Option(0), end = Option(1))))
    val dateTimeRangeFilterSeq = Some(Seq(DateTimeRangeFilterAttributes(field = localDateTimeField,
      start = Option(LocalDateTime.of(2019, 1, 1, 1, 1, 1)),
      end = Option(LocalDateTime.of(2021, 1, 1, 1, 1, 1)))))
    val equalsMultipleFilterSeq = Some(Seq(EqualsMultipleFilterAttributes(field = stringField3, values = List("bar", "value", "str"))))


    val searchRequest = TableSearchRequest(
      containsFilterAttributes = containsFilterSeq,
      intRangeFilterAttributes = intRangeFilterSeq,
      dateTimeRangeFilterAttributes = dateTimeRangeFilterSeq,
      equalsMultipleFilterAttributes = equalsMultipleFilterSeq,
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    result.total shouldBe 1
    result.items should contain theSameElementsAs Seq(TestSearchableData.t1)
  }

  "The contains filter" should "find values that contain the search string" in {
    val filter = ContainsFilterAttributes(field = TestSearchableTableFieldNames.stringField, value = "value")
    val searchRequest = TableSearchRequest(
      containsFilterAttributes = Some(Seq(filter)),
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    val expected = TestSearchableData.testSearchableEntities.filter(_.stringValue.contains("value"))

    result.total should be > 0
    result.total shouldBe expected.size
    result.items should contain theSameElementsAs expected
  }

  it should "not find values that do not contain the search string" in {
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

  "the date-time-range filter" should "find values within the inclusive range" in {
    val startDate = Option(LocalDateTime.of(2020, 3, 1, 0, 0, 0))
    val endDate = Option(LocalDateTime.of(2030, 1, 1, 0, 0, 0))
    val filter = DateTimeRangeFilterAttributes(field = TestSearchableTableFieldNames.localDateTimeField,
      start = startDate, end = endDate)
    val searchRequest = TableSearchRequest(
      dateTimeRangeFilterAttributes = Some(Seq(filter)),
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    val expected = Seq(TestSearchableData.t1, TestSearchableData.t3)
    result.total should be > 0
    result.total shouldBe expected.size
    result.items should contain theSameElementsAs expected
  }

  "the date-time-range filter" should "find values greater or equal to the left bound" in {
    val startDate = Option(LocalDateTime.of(2020, 3, 1, 0, 0, 0))
    val endDate = None
    val filter = DateTimeRangeFilterAttributes(field = TestSearchableTableFieldNames.localDateTimeField,
      start = startDate, end = endDate)
    val searchRequest = TableSearchRequest(
      dateTimeRangeFilterAttributes = Some(Seq(filter)),
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    val expected = Seq(TestSearchableData.t1, TestSearchableData.t3)
    result.total should be > 0
    result.total shouldBe expected.size
    result.items should contain theSameElementsAs expected
  }

  it should "return an empty list if start is higher than end" in {
    val startDate = LocalDateTime.of(2030, 1, 1, 0, 0, 0)
    val endDate = LocalDateTime.of(2020, 3, 1, 0, 0, 0)
    val filter = search.DateTimeRangeFilterAttributes(field = TestSearchableTableFieldNames.localDateTimeField, start = Option(startDate), end = Option(endDate))
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
    val filter = IntRangeFilterAttributes(field = TestSearchableTableFieldNames.longField, start = Option(0), end = Option(2))
    val searchRequest = TableSearchRequest(
      intRangeFilterAttributes = Some(Seq(filter)),
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    val expected = TestSearchableData.testSearchableEntities.filter(e => e.longValue >= 0 && e.longValue <= 2)
    result.total should be > 0
    result.total shouldBe expected.size
    result.items should contain theSameElementsAs expected
  }

  "the int-range filter" should "find values less or equal to the right bound" in {
    val filter = IntRangeFilterAttributes(field = TestSearchableTableFieldNames.longField, start = None, end = Option(2))
    val searchRequest = TableSearchRequest(
      intRangeFilterAttributes = Some(Seq(filter)),
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    val expected = TestSearchableData.testSearchableEntities.filter(e => e.longValue >= 0 && e.longValue <= 2)
    result.total should be > 0
    result.total shouldBe expected.size
    result.items should contain theSameElementsAs expected
  }

  it should "return an empty list if start is higher than end" in {
    val filter = IntRangeFilterAttributes(field = TestSearchableTableFieldNames.longField, start = Option(10), end = Option(0))
    val searchRequest = TableSearchRequest(
      intRangeFilterAttributes = Some(Seq(filter)),
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    result.total shouldBe 0
  }

  "the multiple-attributes filter" should "find values exactly equal to the list of strings" in {
    val filter = EqualsMultipleFilterAttributes(field = TestSearchableTableFieldNames.stringField3, values = List("foo", "bar"))
    val searchRequest = TableSearchRequest(
      equalsMultipleFilterAttributes = Some(Seq(filter)),
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    val expected = TestSearchableData.testSearchableEntities.filter(data => data.stringValue3 == "foo" || data.stringValue3 == "bar" )

    result.total should be > 0
    result.total shouldBe expected.size
    result.items should contain theSameElementsAs expected
  }

  it should "not find values that do not contain the search string" in {
    val filter = EqualsMultipleFilterAttributes(field = TestSearchableTableFieldNames.stringField3, values = List("fo", "ba"))
    val searchRequest = TableSearchRequest(
      equalsMultipleFilterAttributes = Some(Seq(filter)),
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    result.total shouldBe 0
  }

  "sort" should "apply a default sort if no sort column is specified" in {
    val searchRequest = TableSearchRequest(
      sort = None,
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    result.total shouldBe TestSearchableData.testSearchableEntities.size
    result.items.size should be > 0
    result.items should contain theSameElementsInOrderAs TestSearchableData.testSearchableEntities.sortBy(_.longValue)
  }

  it should "apply a sort on the specified column" in {
    val searchRequest = TableSearchRequest(
      sort = Some(SortAttributes(by = TestSearchableTableFieldNames.stringField, order = -1)),
      from = 0,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    result.total shouldBe TestSearchableData.testSearchableEntities.size
    result.items.size should be > 0
    result.items should contain theSameElementsInOrderAs TestSearchableData.testSearchableEntities.sortBy(_.stringValue)(Ordering[String].reverse)
  }

  "from" should "drop the first n elements" in {
    val searchRequest = TableSearchRequest(
      sort = None,
      from = 1,
      size = 50
    )

    val result = await(db.run(underTest.search(searchRequest)))

    result.total shouldBe TestSearchableData.testSearchableEntities.size
    result.items.size should be > 0
    result.items should contain theSameElementsInOrderAs TestSearchableData.testSearchableEntities.sortBy(_.longValue).drop(1)
  }

  "size" should "limit the number of elements" in {
    val searchRequest = TableSearchRequest(
      sort = None,
      from = 0,
      size = 2
    )

    val result = await(db.run(underTest.search(searchRequest)))

    result.total shouldBe TestSearchableData.testSearchableEntities.size
    result.items.size should be > 0
    result.items should contain theSameElementsInOrderAs TestSearchableData.testSearchableEntities.sortBy(_.longValue).take(2)
  }
}
