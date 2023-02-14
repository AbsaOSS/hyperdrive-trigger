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

package za.co.absa.hyperdrive.trigger.persistance

import org.scalatest._
import za.co.absa.hyperdrive.trigger.models.dagRuns.DagRun
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses
import za.co.absa.hyperdrive.trigger.models.search.{
  ContainsFilterAttributes,
  DateTimeRangeFilterAttributes,
  EqualsMultipleFilterAttributes,
  LongFilterAttributes,
  SortAttributes,
  TableSearchRequest,
  TableSearchResponse
}

import java.time.{LocalDateTime, ZoneId}
import scala.concurrent.ExecutionContext.Implicits.global

class DagRunRepositoryTest
    extends FlatSpec
    with Matchers
    with BeforeAndAfterAll
    with BeforeAndAfterEach
    with RepositoryH2TestBase {

  val dagRunRepository: DagRunRepository = new DagRunRepositoryImpl(dbProvider) { override val profile = h2Profile }

  override def beforeAll: Unit =
    schemaSetup()

  override def afterAll: Unit =
    schemaDrop()

  override def afterEach: Unit =
    clearData()

  "dagRunRepository.searchDagRuns" should "return zero dag runs when db is empty" in {
    val searchRequest: TableSearchRequest = TableSearchRequest(sort = None, from = 0, size = Integer.MAX_VALUE)

    val result: TableSearchResponse[DagRun] = await(dagRunRepository.searchDagRuns(searchRequest))
    result.total shouldBe 0
    result.items shouldBe Seq.empty[DagRun]
  }

  "dagRunRepository.searchDagRuns" should "return all dag runs with no search query ordered by id desc" in {
    createTestData()
    val searchRequest: TableSearchRequest = TableSearchRequest(sort = None, from = 0, size = Integer.MAX_VALUE)

    val result: TableSearchResponse[DagRun] = await(dagRunRepository.searchDagRuns(searchRequest))
    result.total shouldBe TestData.dagRuns.size
    result.items should contain theSameElementsInOrderAs TestData.dagRuns.sortBy(_.id).reverse
  }

  "dagRunRepository.searchDagRuns" should "using from and size should return paginated dag runs" in {
    createTestData()
    val searchRequest: TableSearchRequest = TableSearchRequest(sort = None, from = 2, size = 2)

    val result: TableSearchResponse[DagRun] = await(dagRunRepository.searchDagRuns(searchRequest))
    result.total shouldBe TestData.dagRuns.size
    result.items.size shouldBe 2
  }

  "dagRunRepository.searchDagRuns" should "using sort by workflow name (asc order) should return sorted dag runs" in {
    createTestData()
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = Option(SortAttributes(by = "workflowName", order = 1)),
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[DagRun] = await(dagRunRepository.searchDagRuns(searchRequest))
    result.total shouldBe TestData.dagRuns.size
    result.items.size shouldBe TestData.dagRuns.size
    result.items should contain theSameElementsInOrderAs TestData.dagRuns.sortBy(r => (r.workflowName, -r.id))
  }

  "dagRunRepository.searchDagRuns" should "using sort by started (desc order) should return sorted dag runs" in {
    createTestData()
    val searchRequest: TableSearchRequest =
      TableSearchRequest(sort = Option(SortAttributes(by = "started", order = -1)), from = 0, size = Integer.MAX_VALUE)

    val result: TableSearchResponse[DagRun] = await(dagRunRepository.searchDagRuns(searchRequest))
    result.total shouldBe TestData.dagRuns.size
    result.items.size shouldBe TestData.dagRuns.size
    val expected = TestData.dagRuns.sortBy(r => (-r.started.atZone(ZoneId.systemDefault()).toEpochSecond, -r.id))
    result.items should contain theSameElementsInOrderAs expected
  }

  "dagRunRepository.searchDagRuns" should "apply filters" in {
    createTestData()

    val dateTimeRangeFilter = Some(
      Seq(
        DateTimeRangeFilterAttributes(
          field = "started",
          start = None,
          end = Some(LocalDateTime.now().minusMinutes(20L))
        )
      )
    )
    val equalsMultipleFilter =
      Some(Seq(EqualsMultipleFilterAttributes(field = "status", values = List(DagInstanceStatuses.InQueue.name))))
    val searchRequest = TableSearchRequest(
      dateTimeRangeFilterAttributes = dateTimeRangeFilter,
      equalsMultipleFilterAttributes = equalsMultipleFilter,
      sort = None,
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result = await(dagRunRepository.searchDagRuns(searchRequest))

    val expected = TestData.dagRuns.filter(dagRun =>
      dagRun.started.isBefore(LocalDateTime.now().minusMinutes(20L)) &&
        dagRun.status == DagInstanceStatuses.InQueue.name
    )
    result.total should be > 0
    result.total shouldBe expected.size
    result.items should contain theSameElementsAs expected
  }

  it should "apply contains filters" in {
    createTestData()
    val containsFilters = Some(
      Seq(
        ContainsFilterAttributes(field = "workflowName", value = "flow1", isCaseSensitive = true),
        ContainsFilterAttributes(field = "status", value = "Que", isCaseSensitive = true),
        ContainsFilterAttributes(field = "triggeredBy", value = TestData.triggeredBy, isCaseSensitive = true),
        ContainsFilterAttributes(field = "projectName", value = "project", isCaseSensitive = true)
      )
    )

    val searchRequest =
      TableSearchRequest(containsFilterAttributes = containsFilters, sort = None, from = 0, size = Integer.MAX_VALUE)

    val result = await(dagRunRepository.searchDagRuns(searchRequest))
    val expected = TestData.dagRuns.filter(dagRun =>
      dagRun.workflowName.contains("flow1") &&
        dagRun.status.contains("Que")
    )

    result.total should be > 0
    result.items should contain theSameElementsAs expected
  }

  it should "apply filter by workflowId" in {
    createTestData()
    val longFilters = Some(Seq(LongFilterAttributes(field = "workflowId", value = 100L)))

    val searchRequest =
      TableSearchRequest(longFilterAttributes = longFilters, sort = None, from = 0, size = Integer.MAX_VALUE)

    val result = await(dagRunRepository.searchDagRuns(searchRequest))
    val expected = TestData.dagRuns.filter(_.workflowId == 100L)

    result.total should be > 0
    result.items should contain theSameElementsAs expected
  }

  it should "apply filter by dag instance id" in {
    createTestData()
    val longFilters = Some(Seq(LongFilterAttributes(field = "id", value = 200L)))

    val searchRequest =
      TableSearchRequest(longFilterAttributes = longFilters, sort = None, from = 0, size = Integer.MAX_VALUE)

    val result = await(dagRunRepository.searchDagRuns(searchRequest))
    val expected = TestData.dagRuns.filter(_.id == 200L)

    result.total should be > 0
    result.items should contain theSameElementsAs expected
  }

  it should "apply filter by finished" in {
    createTestData()

    val dateTimeRangeFilter = Some(
      Seq(
        DateTimeRangeFilterAttributes(
          field = "finished",
          start = None,
          end = Some(LocalDateTime.now().plusMinutes(20L))
        )
      )
    )

    val searchRequest = TableSearchRequest(
      dateTimeRangeFilterAttributes = dateTimeRangeFilter,
      sort = None,
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result = await(dagRunRepository.searchDagRuns(searchRequest))

    val expected =
      TestData.dagRuns.filter(dagRun => dagRun.finished.exists(_.isBefore(LocalDateTime.now().plusMinutes(20L))))
    result.total should be > 0
    result.total shouldBe expected.size
    result.items should contain theSameElementsAs expected
  }
}
