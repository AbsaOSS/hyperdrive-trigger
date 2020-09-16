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

import scala.concurrent.ExecutionContext.Implicits.global

class JobTemplateRepositoryTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with RepositoryTestBase {

  val jobTemplateRepository: JobTemplateRepository = new JobTemplateRepositoryImpl { override val profile = h2Profile }

  override def beforeAll: Unit = {
    h2SchemaSetup()
  }

  override def afterAll: Unit = {
    h2SchemaDrop()
  }

  override def afterEach: Unit = {
    clearData()
  }

  "getJobTemplate" should "return a job template by id" in {
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
}
