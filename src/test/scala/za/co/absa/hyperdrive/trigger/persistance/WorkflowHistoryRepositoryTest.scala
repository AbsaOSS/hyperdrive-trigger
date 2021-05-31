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
import scala.concurrent.duration.Duration

class WorkflowHistoryRepositoryTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with RepositoryH2TestBase {

  val workflowHistoryRepository: WorkflowHistoryRepository = new WorkflowHistoryRepositoryImpl {
    override val profile = h2Profile
  }

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

  "workflowHistoryRepository create/update/delete/getHistoryForWorkflow" should "create workflow history record with correct values" in {
    val workflowCreate = WorkflowFixture.createWorkflowJoined()
    val workflowUpdate = workflowCreate.copy(name = workflowCreate.name + "-updated")
    val workflowDelete = workflowCreate.copy(name = workflowCreate.name + "-deleted")

    val workflowId = workflowCreate.id
    val user = "fakeUser"

    val createResultId = TestUtils.await(db.run(workflowHistoryRepository.create(workflowCreate, user)))
    val updateResultId = TestUtils.await(db.run(workflowHistoryRepository.update(workflowUpdate, user)))
    val deleteResultId = TestUtils.await(db.run(workflowHistoryRepository.delete(workflowDelete, user)))

    val result = TestUtils.await(workflowHistoryRepository.getHistoryForWorkflow(workflowId))
    result.size shouldBe 3
    verifyHistory(result, createResultId, user, DBOperation.Create) shouldBe true
    verifyHistory(result, updateResultId, user, DBOperation.Update) shouldBe true
    verifyHistory(result, deleteResultId, user, DBOperation.Delete) shouldBe true
  }

  "workflowHistoryRepository.getHistoryForWorkflow" should "return empty array when db does not contain history record for specific workflow id" in {
    val workflowId = 999

    val result = TestUtils.await(workflowHistoryRepository.getHistoryForWorkflow(workflowId))
    result.size shouldBe 0
  }

  "workflowHistoryRepository.getWorkflowsFromHistory" should "return two workflows from history for comparison" in {
    val workflowCreate = WorkflowFixture.createWorkflowJoined()
    val workflowUpdate = workflowCreate.copy(name = workflowCreate.name + "-updated")

    val workflowId = workflowCreate.id
    val user = "fakeUser"

    val createResultId = TestUtils.await(db.run(workflowHistoryRepository.create(workflowCreate, user)))
    val updateResultId = TestUtils.await(db.run(workflowHistoryRepository.update(workflowUpdate, user)))

    val result = TestUtils.await(workflowHistoryRepository.getWorkflowsFromHistory(updateResultId, createResultId))
    verifyHistory(Seq(result.leftWorkflowHistory.history), updateResultId, user, DBOperation.Update) shouldBe true
    verifyHistory(Seq(result.rightWorkflowHistory.history), createResultId, user, DBOperation.Create) shouldBe true
    result.leftWorkflowHistory.workflowId shouldBe workflowId
    result.leftWorkflowHistory.workflow shouldBe workflowUpdate
    result.leftWorkflowHistory.workflow.name shouldBe workflowUpdate.name
    result.rightWorkflowHistory.workflowId shouldBe workflowId
    result.rightWorkflowHistory.workflow shouldBe workflowCreate
    result.rightWorkflowHistory.workflow.name shouldBe workflowCreate.name
  }

  "workflowHistoryRepository.getWorkflowsFromHistory" should "throw db exception when one of the history records does not exist" in {
    val workflowCreate = WorkflowFixture.createWorkflowJoined()

    val user = "fakeUser"

    val createResultId = TestUtils.await(db.run(workflowHistoryRepository.create(workflowCreate, user)))
    val notCreatedId = 999
    val exceptionResult = the [Exception] thrownBy
      TestUtils.await(workflowHistoryRepository.getWorkflowsFromHistory(createResultId, notCreatedId))

    exceptionResult.getMessage should equal (s"Workflow history with ${createResultId} or ${notCreatedId} does not exist.")
  }
}
