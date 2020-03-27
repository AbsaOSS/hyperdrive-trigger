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

import org.scalatest.{FlatSpec, _}
import za.co.absa.hyperdrive.trigger.models.dagRuns.DagRun
import za.co.absa.hyperdrive.trigger.models.search.{IntRangeFilterAttributes, SortAttributes, StringEqualsFilterAttributes, TableSearchRequest, TableSearchResponse}

import scala.concurrent.ExecutionContext.Implicits.global

class DagRunRepositoryTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with RepositoryTestBase {

  val dagRunRepository: DagRunRepository = new DagRunRepositoryImpl { override val profile = h2Profile }

  override def beforeAll: Unit = {
    h2SchemaSetup()
  }

  override def afterAll: Unit = {
    h2SchemaDrop()
  }

  override def afterEach: Unit = {
    clearData()
  }

  "dagRunRepository.searchDagRuns" should "return zero dag runs when db is empty" in {
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = None,
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[DagRun] = await(dagRunRepository.searchDagRuns(searchRequest))
    result.total shouldBe 0
    result.items shouldBe Seq.empty[DagRun]
  }

  "dagRunRepository.searchDagRuns" should "return all dag runs with no search query" in {
    createTestData()
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = None,
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[DagRun] = await(dagRunRepository.searchDagRuns(searchRequest))
    result.total shouldBe TestData.dagRuns.size
    result.items shouldBe TestData.dagRuns
  }

  "dagRunRepository.searchDagRuns" should "using from and size should return paginated dag runs" in {
    createTestData()
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = None,
      from = 2,
      size = 2
    )

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
    result.items shouldBe TestData.dagRuns.sortBy(_.workflowName)
  }

  "dagRunRepository.searchDagRuns" should "using sort by job count (desc order) should return sorted dag runs" in {
    createTestData()
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = Option(SortAttributes(by = "jobCount", order = -1)),
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[DagRun] = await(dagRunRepository.searchDagRuns(searchRequest))
    result.total shouldBe TestData.dagRuns.size
    result.items.size shouldBe TestData.dagRuns.size
    result.items shouldBe TestData.dagRuns.sortWith(_.jobCount > _.jobCount)
  }

  "dagRunRepository.searchDagRuns" should "using sort by started (desc order) should return sorted dag runs" in {
    createTestData()
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = Option(SortAttributes(by = "started", order = -1)),
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[DagRun] = await(dagRunRepository.searchDagRuns(searchRequest))
    result.total shouldBe TestData.dagRuns.size
    result.items.size shouldBe TestData.dagRuns.size
    result.items shouldBe TestData.dagRuns.sortWith((first, second) => first.started.isAfter(second.started))
  }

  "dagRunRepository.searchDagRuns" should "apply filters" in {
    createTestData()
    val stringEqualsFilterSeq = Option(Seq(
      StringEqualsFilterAttributes(field = "projectName", value = "projectName1")
    ))
    val intRangeFilterSeq = Option(Seq(
      IntRangeFilterAttributes(field = "jobCount", start = 0, end = 5)
    ))
    val searchRequest: TableSearchRequest = TableSearchRequest(
      stringEqualsFilterAttributes = stringEqualsFilterSeq,
      intRangeFilterAttributes = intRangeFilterSeq,
      sort = None,
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result = await(dagRunRepository.searchDagRuns(searchRequest))

    val expected = TestData.dagRuns.filter(dagRun => dagRun.projectName == "projectName1" && dagRun.jobCount <= 5)
    result.total should be > 0
    result.total shouldBe expected.size
    result.items should contain theSameElementsAs expected
  }
}
