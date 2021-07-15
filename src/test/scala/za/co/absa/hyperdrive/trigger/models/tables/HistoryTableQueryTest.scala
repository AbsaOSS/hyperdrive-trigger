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

import org.scalatest._
import scala.concurrent.ExecutionContext.Implicits.global

class HistoryTableQueryTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with TestHistoryRepositoryTestBase {

  behavior of "HistoryTableQuery"

  val underTest = testHistoryTable

  override def beforeAll: Unit = {
    createSchema()
  }

  override def afterAll: Unit = {
    dropSchema()
  }

  override def beforeEach: Unit = {
    createHistoryTestData()
  }

  override def afterEach: Unit = {
    dropTable()
  }

  "getHistoryForEntity" should "return empty array when db does not contain history record for specific entity id" in {
    val workflowId = 999

    val result = await(db.run(underTest.getHistoryForEntity(workflowId)))
    result.size shouldBe 0
  }

  "getEntitiesFromHistory" should "return two entities from history for comparison" in {
    val result = await(db.run(underTest.getEntitiesFromHistory(TestHistoryData.t1.id, TestHistoryData.t2.id)))
    result.leftHistory shouldBe TestHistoryData.t1
    result.rightHistory shouldBe TestHistoryData.t2
  }

  it should "throw db exception when one of the history records does not exist" in {
    val exceptionResult = the [Exception] thrownBy
      await(db.run(underTest.getEntitiesFromHistory(TestHistoryData.t1.id, 999)))

    exceptionResult.getMessage shouldBe s"Entities with #${TestHistoryData.t1.id} or #999 don't exist on HistoryTableQueryTest.this.TestHistoryTable."
  }
}
