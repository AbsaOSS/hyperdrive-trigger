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
import slick.jdbc.SetParameter.{SetInt, SetString, SetStringOption}
import slick.jdbc.{ActionBasedSQLInterpolation, GetResult, MacroTreeBuilder, PositionedParameters, SQLActionBuilder, SetParameter}
import za.co.absa.hyperdrive.trigger.models.dagRuns.DagRun
import za.co.absa.hyperdrive.trigger.models.search.{DateTimeRangeFilterAttributes, IntRangeFilterAttributes, SortAttributes, TableSearchRequest, TableSearchResponse}

import java.time.LocalDateTime
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.reflect.macros.blackbox

class DagRunRepositoryTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with RepositoryH2TestBase {

  val dagRunRepository: DagRunRepository = new DagRunRepositoryImpl(dbProvider) { override val profile = h2Profile }

  override def beforeAll: Unit = {
    schemaSetup()
  }

  override def afterAll: Unit = {
    schemaDrop()
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
    result.total shouldBe TestData.getDagRuns.size
    result.items shouldBe TestData.getDagRuns
  }

  "dagRunRepository.searchDagRuns" should "using from and size should return paginated dag runs" in {
    createTestData()
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = None,
      from = 2,
      size = 2
    )

    val result: TableSearchResponse[DagRun] = await(dagRunRepository.searchDagRuns(searchRequest))
    result.total shouldBe TestData.getDagRuns.size
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
    result.total shouldBe TestData.getDagRuns.size
    result.items.size shouldBe TestData.getDagRuns.size
    result.items shouldBe TestData.getDagRuns.sortBy(_.workflowName)
  }

  "dagRunRepository.searchDagRuns" should "using sort by started (desc order) should return sorted dag runs" in {
    createTestData()
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = Option(SortAttributes(by = "started", order = -1)),
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[DagRun] = await(dagRunRepository.searchDagRuns(searchRequest))
    result.total shouldBe TestData.getDagRuns.size
    result.items.size shouldBe TestData.getDagRuns.size
    val expected = TestData.getDagRuns.sortWith((first, second) => first.started.isAfter(second.started))
    result.items shouldBe expected
  }

  "dagRunRepository.searchDagRuns" should "apply filters" in {
    createTestData()

    val dateTimeRangeFilterSeq = Option(Seq(
      DateTimeRangeFilterAttributes(field = "started", start = None, end = Some(LocalDateTime.now().minusMinutes(20L)))
    ))
    val searchRequest: TableSearchRequest = TableSearchRequest(
      dateTimeRangeFilterAttributes = dateTimeRangeFilterSeq,
      sort = None,
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result = await(dagRunRepository.searchDagRuns(searchRequest))

    val expected = TestData.getDagRuns.filter(dagRun => dagRun.started.isBefore(LocalDateTime.now().minusMinutes(20L)))
    result.total should be > 0
    result.total shouldBe expected.size
    result.items should contain theSameElementsAs expected
  }
}
