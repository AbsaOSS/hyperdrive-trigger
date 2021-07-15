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
import za.co.absa.hyperdrive.trigger.models.JobTemplate
import za.co.absa.hyperdrive.trigger.models.errors.ApiException
import za.co.absa.hyperdrive.trigger.models.search.{ContainsFilterAttributes, SortAttributes, TableSearchRequest, TableSearchResponse}

import scala.concurrent.ExecutionContext.Implicits.global

class JobTemplateRepositoryPostgresTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with RepositoryPostgresTestBase {

  val jobTemplateRepository: JobTemplateRepository = new JobTemplateRepositoryImpl(dbProvider)

  override def beforeAll: Unit = {
    super.beforeAll()
    schemaSetup()
  }

  override def afterAll: Unit = {
    schemaDrop()
  }

  override def afterEach: Unit = {
    clearData()
  }

  "getJobTemplatesByIds" should "return a job template by ids" in {
    insertJobTemplates()
    val result = await(jobTemplateRepository.getJobTemplatesByIds(Seq(100)))
    result should have size 1
    result.head.id shouldBe 100
  }

  "getJobTemplates" should "return all job templates" in {
    insertJobTemplates()
    val result = await(jobTemplateRepository.getJobTemplates())
    result should contain theSameElementsAs TestData.jobTemplates
  }

  "getJobTemplateIdsByNames" should "return a mapping from names to template ids" in {
    insertJobTemplates()
    val result = await(jobTemplateRepository.getJobTemplateIdsByNames(Seq("jobTemplate1", "jobTemplate2")))

    val expected = Map("jobTemplate1" -> 100L, "jobTemplate2" -> 101L)
    result should contain theSameElementsAs expected
  }

  "searchJobTemplates" should "return zero job templates when db is empty" in {
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = None,
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[JobTemplate] = await(jobTemplateRepository.searchJobTemplates(searchRequest))
    result.total shouldBe 0
    result.items shouldBe Seq.empty[JobTemplate]
  }

  "searchJobTemplates" should "return all job templates with no search query" in {
    insertJobTemplates()
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = None,
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[JobTemplate] = await(jobTemplateRepository.searchJobTemplates(searchRequest))
    result.total shouldBe TestData.jobTemplates.size
    result.items shouldBe TestData.jobTemplates
  }

  "searchJobTemplates" should "using from and size should return paginated job templates" in {
    insertJobTemplates()
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = None,
      from = 1,
      size = 1
    )

    val result: TableSearchResponse[JobTemplate] = await(jobTemplateRepository.searchJobTemplates(searchRequest))
    result.total shouldBe TestData.jobTemplates.size
    result.items.size shouldBe 1
  }

  "searchJobTemplates" should "using sort by template name (asc order) should return sorted job templates" in {
    insertJobTemplates()
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = Option(SortAttributes(by = "name", order = 1)),
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[JobTemplate] = await(jobTemplateRepository.searchJobTemplates(searchRequest))
    result.total shouldBe TestData.jobTemplates.size
    result.items.size shouldBe TestData.jobTemplates.size
    result.items shouldBe TestData.jobTemplates.sortBy(_.name)
  }

  "searchJobTemplates" should "using sort by template name (desc order) should return sorted job templates" in {
    insertJobTemplates()
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = Option(SortAttributes(by = "name", order = -1)),
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[JobTemplate] = await(jobTemplateRepository.searchJobTemplates(searchRequest))
    result.total shouldBe TestData.jobTemplates.size
    result.items.size shouldBe TestData.jobTemplates.size
    result.items shouldBe TestData.jobTemplates.sortBy(_.name).reverse
  }

  "searchJobTemplates" should "apply filters" in {
    insertJobTemplates()

    val containsFilterAttributes = Option(Seq(
      ContainsFilterAttributes(field = "name", value = TestData.jobTemplates.head.name)
    ))
    val searchRequest: TableSearchRequest = TableSearchRequest(
      containsFilterAttributes = containsFilterAttributes,
      sort = None,
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result = await(jobTemplateRepository.searchJobTemplates(searchRequest))

    val expected = TestData.jobTemplates.filter(jobTemplate => jobTemplate.name == TestData.jobTemplates.head.name)
    result.total should be > 0
    result.total shouldBe expected.size
    result.items should contain theSameElementsAs expected
  }

  "getJobTemplate" should "return a job template by id" in {
    insertJobTemplates()
    val jobTemplate = TestData.jobTemplates.head

    val result = await(jobTemplateRepository.getJobTemplate(jobTemplate.id))

    result shouldBe jobTemplate
  }

  "getJobTemplate" should "throw exception when job template does not exist" in {
    insertJobTemplates()
    val jobTemplateId = 999111

    val exception = the [ApiException] thrownBy await(jobTemplateRepository.getJobTemplate(jobTemplateId))

    exception.getMessage shouldBe s"Job template with id ${jobTemplateId} does not exist."
  }
}
