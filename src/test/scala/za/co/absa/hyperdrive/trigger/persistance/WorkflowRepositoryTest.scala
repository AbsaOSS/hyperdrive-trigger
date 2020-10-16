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

import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{FlatSpec, _}

import scala.concurrent.ExecutionContext
import scala.concurrent.ExecutionContext.Implicits.global

class WorkflowRepositoryTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach
  with RepositoryTestBase with MockitoSugar {

  val workflowHistoryRepositoryMock: WorkflowHistoryRepository = mock[WorkflowHistoryRepository]
  val workflowHistoryRepository: WorkflowHistoryRepository = new WorkflowHistoryRepositoryImpl() {
    override val profile = h2Profile
  }

  val workflowRepositoryMocked: WorkflowRepository = new WorkflowRepositoryImpl(workflowHistoryRepositoryMock) {
    override val profile = h2Profile
  }

  val workflowRepository: WorkflowRepository = new WorkflowRepositoryImpl(workflowHistoryRepository) {
    override val profile = h2Profile
  }

  import h2Profile.api._

  override def beforeAll: Unit = {
    h2SchemaSetup()
  }

  override def afterAll: Unit = {
    h2SchemaDrop()
  }

  override def beforeEach: Unit = {
    reset(workflowHistoryRepositoryMock)
  }

  override def afterEach: Unit = {
    clearData()
  }

  "getWorkflow" should "return the workflow" in {
    createTestData()
    val expectedWorkflow = TestDataJoined.wj1

    val actualWorkflow = await(workflowRepository.getWorkflow(expectedWorkflow.id))

    actualWorkflow shouldBe expectedWorkflow
  }

  it should "throw an exception if the workflow doesn't exist" in {
    val exception = the [Exception] thrownBy await(workflowRepository.getWorkflow(42))
    exception.getMessage should include("42")
  }

  "getWorkflows" should "return the workflows" in {
    createTestData()
    val expectedWorkflows = Seq(TestDataJoined.wj1, TestDataJoined.wj2)
    val ids = expectedWorkflows.map(_.id)
    val actualWorkflows = await(workflowRepository.getWorkflows(ids))

    actualWorkflows should contain theSameElementsAs expectedWorkflows
  }

  it should "return an empty seq if no workflows are found" in {
    val actualWorkflows = await(workflowRepository.getWorkflows(Seq(42)))
    actualWorkflows shouldBe empty
  }


  "switchWorkflowActiveState" should "switch the active state and create a history entry" in {
    createTestData()
    val workflowId = TestData.w1.id
    val isActiveBefore = TestData.w1.isActive

    await(workflowRepository.switchWorkflowActiveState(workflowId, "testUser"))

    val actualWorkflow = await(workflowRepository.getWorkflow(workflowId))
    actualWorkflow.isActive shouldBe !isActiveBefore
    val actualHistoryEntries = await(db.run(workflowHistoryTable.result))
    actualHistoryEntries should have size 1
    actualHistoryEntries.head.workflow.id shouldBe workflowId
    actualHistoryEntries.head.workflow.isActive shouldBe !isActiveBefore
  }

  it should "fail if the workflow doesn't exist" in {
    val exception = the [Exception] thrownBy await(workflowRepositoryMocked.switchWorkflowActiveState(42L, "testUser"))

    exception.getMessage should include("42")
  }

  it should "fail if inserting the history entry fails" in {
    createTestData()
    val workflowId = TestData.w1.id
    when(workflowHistoryRepositoryMock.update(any(), any())(any[ExecutionContext])).thenReturn(DBIO.failed(new Exception("Could not insert history entry")))

    val exception = the [Exception] thrownBy await(workflowRepositoryMocked.switchWorkflowActiveState(workflowId, "testUser"))

    exception.getMessage shouldBe "Could not insert history entry"
  }

  "updateWorkflowsIsActive" should "activate the workflows" in {
    createTestData()
    val workflowIds = TestData.workflows.map(_.id)

    await(workflowRepository.updateWorkflowsIsActive(workflowIds, isActiveNewValue = true, "testUser"))

    val actualWorkflows = await(workflowRepository.getWorkflows())
    actualWorkflows.map(_.isActive) should contain only true
    val actualHistoryEntries = await(db.run(workflowHistoryTable.result))
    actualHistoryEntries should have size TestData.workflows.size
    actualHistoryEntries.map(_.workflowId) should contain theSameElementsAs workflowIds
  }

  it should "deactivate the workflows" in {
    createTestData()
    val workflowIds = TestData.workflows.map(_.id)

    await(workflowRepository.updateWorkflowsIsActive(workflowIds, isActiveNewValue = false, "testUser"))

    val actualWorkflows = await(workflowRepository.getWorkflows())
    actualWorkflows.map(_.isActive) should contain only false
    val actualHistoryEntries = await(db.run(workflowHistoryTable.result))
    actualHistoryEntries should have size TestData.workflows.size
    actualHistoryEntries.map(_.workflowId) should contain theSameElementsAs workflowIds
  }

  it should "do nothing when called with an empty seq" in {
    createTestData()

    await(workflowRepository.updateWorkflowsIsActive(Seq(), isActiveNewValue = true,"testUser"))

    val actualWorkflows = await(workflowRepository.getWorkflows())
    actualWorkflows.map(_.updated) should contain only None
    val actualHistoryEntries = await(db.run(workflowHistoryTable.result))
    actualHistoryEntries shouldBe empty
  }

  it should "not change the active state of any workflow if inserting the history entry fails" in {
    createTestData()
    val workflowIds = TestData.workflows.map(_.id)
    when(workflowHistoryRepositoryMock.update(any(), any())(any[ExecutionContext])).thenReturn(DBIO.failed(new Exception("Could not insert history entry")))

    val exception = the [Exception] thrownBy await(workflowRepositoryMocked.updateWorkflowsIsActive(workflowIds, isActiveNewValue = true, "testUser"))

    exception.getMessage shouldBe "Could not insert history entry"
    val actualWorkflows = await(workflowRepositoryMocked.getWorkflows())
    actualWorkflows.map(_.updated) should contain only None
    val actualHistoryEntries = await(db.run(workflowHistoryTable.result))
    actualHistoryEntries shouldBe empty
  }

  it should "not change the active state of any workflow and not create history entries if an exception is thrown" in {
    // given
    createTestData()
    val activeStateW1 = TestData.w1.isActive
    val activeStateW2 = TestData.w2.isActive
    val activeStateW3 = TestData.w3.isActive

    val nonExistentWorkflowId = 9999L
    val workflowIds = TestData.workflows.map(_.id) :+ nonExistentWorkflowId

    // when
    val exception = the [Exception] thrownBy await(workflowRepository.updateWorkflowsIsActive(workflowIds, isActiveNewValue = true, "testUser"))

    // then
    exception.getMessage should include("9999")
    val workflow1 = await(workflowRepository.getWorkflow(TestData.w1.id))
    val workflow2 = await(workflowRepository.getWorkflow(TestData.w2.id))
    val workflow3 = await(workflowRepository.getWorkflow(TestData.w3.id))

    workflow1.isActive shouldBe activeStateW1
    workflow2.isActive shouldBe activeStateW2
    workflow3.isActive shouldBe activeStateW3

    workflow1.updated shouldBe None
    workflow2.updated shouldBe None
    workflow3.updated shouldBe None

    val historyEntries = await(db.run(workflowHistoryTable.result))
    historyEntries shouldBe empty
  }
}
