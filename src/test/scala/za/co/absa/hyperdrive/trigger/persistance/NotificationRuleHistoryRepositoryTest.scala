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
import za.co.absa.hyperdrive.trigger.TestUtils
import za.co.absa.hyperdrive.trigger.api.rest.services.WorkflowFixture
import za.co.absa.hyperdrive.trigger.models.History
import za.co.absa.hyperdrive.trigger.models.enums.DBOperation
import za.co.absa.hyperdrive.trigger.models.enums.DBOperation.DBOperation

import scala.concurrent.ExecutionContext.Implicits.global

class NotificationRuleHistoryRepositoryTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with RepositoryH2TestBase {
  import api._

  private val h2NotificationRuleHistoryRepository: NotificationRuleHistoryRepository =
    new NotificationRuleHistoryRepositoryImpl(dbProvider) with H2Profile  {
      override val profile = h2Profile
    }

  private val h2NotificationRuleHistoryTable = h2NotificationRuleHistoryRepository.notificationRuleHistoryTable

  override def beforeAll: Unit = {
    schemaSetup()
  }

  override def afterAll: Unit = {
    schemaDrop()
  }

  override def afterEach: Unit = {
    clearData()
  }

  private def verifyHistory(historyEntries: Seq[History], historyId: Long, user: String, dbOperation: DBOperation): Boolean = {
    historyEntries.exists(history => {
      history.id == historyId && history.changedBy == user && history.operation == dbOperation
    })
  }

  "notificationRuleHistoryRepository create/update/delete/getHistoryForWorkflow" should "create workflow history record with correct values" in {
    val nrCreate = TestData.nr1
    val nrUpdate = nrCreate.copy(project = nrCreate.project.map(_ + "-updated"))

    val createId = await(db.run(h2NotificationRuleHistoryRepository.create(nrCreate, "create-user")))
    val updateId = await(db.run(h2NotificationRuleHistoryRepository.update(nrUpdate, "update-user")))
    val deleteId = await(db.run(h2NotificationRuleHistoryRepository.delete(nrUpdate, "delete-user")))

    val result = await(db.run(h2NotificationRuleHistoryTable.result))
    result.size shouldBe 3
    val historyEntries = result.map(_.history)
    verifyHistory(historyEntries, createId, "create-user", DBOperation.Create) shouldBe true
    verifyHistory(historyEntries, updateId, "update-user", DBOperation.Update) shouldBe true
    verifyHistory(historyEntries, deleteId, "delete-user", DBOperation.Delete) shouldBe true
  }
}
