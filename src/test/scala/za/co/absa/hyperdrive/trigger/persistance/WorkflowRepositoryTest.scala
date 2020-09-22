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

import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.{any, eq => eqTo}
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{FlatSpec, _}
import za.co.absa.hyperdrive.trigger.models.WorkflowJoined

import scala.concurrent.ExecutionContext
import scala.concurrent.ExecutionContext.Implicits.global

class WorkflowRepositoryTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach
  with RepositoryTestBase with MockitoSugar {

  val workflowHistoryRepository: WorkflowHistoryRepository = mock[WorkflowHistoryRepository]

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
    reset(workflowHistoryRepository)
  }

  override def afterEach: Unit = {
    clearData()
  }

  "switchWorkflowActiveState" should "switch the active state and create a history entry" in {
    createTestData()
    val workflowId = TestData.w1.id
    val isActiveBefore = TestData.w1.isActive
    when(workflowHistoryRepository.update(any(), any())(any[ExecutionContext])).thenReturn(DBIO.successful(1L))

    await(workflowRepository.switchWorkflowActiveState(workflowId, "testUser"))

    val result = await(workflowRepository.getWorkflow(workflowId))
    result.isActive shouldBe !isActiveBefore
    val workflowCaptor: ArgumentCaptor[WorkflowJoined] = ArgumentCaptor.forClass(classOf[WorkflowJoined])
    verify(workflowHistoryRepository, times(1)).update(workflowCaptor.capture(), eqTo("testUser"))(any[ExecutionContext])
    workflowCaptor.getValue.id shouldBe workflowId
    workflowCaptor.getValue.isActive shouldBe !isActiveBefore
  }

  it should "fail if the workflow doesn't exist" in {
    when(workflowHistoryRepository.update(any(), any())(any[ExecutionContext])).thenReturn(DBIO.successful(1L))

    val exception = the [Exception] thrownBy await(workflowRepository.switchWorkflowActiveState(42L, "testUser"))

    exception.getMessage should include("42")
  }

  it should "fail if inserting the history entry fails" in {
    createTestData()
    val workflowId = TestData.w1.id
    when(workflowHistoryRepository.update(any(), any())(any[ExecutionContext])).thenReturn(DBIO.failed(new Exception("Could not insert history entry")))

    val exception = the [Exception] thrownBy await(workflowRepository.switchWorkflowActiveState(workflowId, "testUser"))

    exception.getMessage shouldBe "Could not insert history entry"
  }

  "activateWorkflows" should "activate the workflows" in {
    createTestData()
    val workflowIds = TestData.workflows.map(_.id)
    when(workflowHistoryRepository.update(any(), any())(any[ExecutionContext])).thenReturn(DBIO.successful(1L))

    await(workflowRepository.activateWorkflows(workflowIds, "testUser"))

    val result = await(workflowRepository.getWorkflows())
    result.map(_.isActive) should contain only true
    val workflowCaptor: ArgumentCaptor[WorkflowJoined] = ArgumentCaptor.forClass(classOf[WorkflowJoined])
    verify(workflowHistoryRepository, times(3)).update(workflowCaptor.capture(), eqTo("testUser"))(any[ExecutionContext])
    import scala.collection.JavaConverters._
    workflowCaptor.getAllValues.asScala.map(_.id) should contain theSameElementsAs workflowIds
  }

  it should "do nothing when called with an empty seq" in {
    createTestData()

    await(workflowRepository.activateWorkflows(Seq(), "testUser"))

    verify(workflowHistoryRepository, never())
  }

  it should "not change the active state of any workflow if an exception is thrown" in {
    createTestData()
    val activeStateW1 = TestData.w1.isActive
    val activeStateW2 = TestData.w2.isActive
    val activeStateW3 = TestData.w3.isActive

    val nonExistentWorkflowId = 9999L
    val workflowIds = nonExistentWorkflowId +: TestData.workflows.map(_.id)
    when(workflowHistoryRepository.update(any(), any())(any[ExecutionContext])).thenReturn(DBIO.successful(1L))
    val exception = the [Exception] thrownBy await(workflowRepository.activateWorkflows(workflowIds, "testUser"))

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
  }
}
