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

import java.time.LocalDateTime

import org.scalatest.FlatSpec
import org.scalatest._
import za.co.absa.hyperdrive.trigger.models.{DagInstance, Workflow}
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses

import scala.concurrent.ExecutionContext.Implicits.global

class DagInstanceRepositoryTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with RepositoryH2TestBase {

  import api._
  val dagInstanceRepository: DagInstanceRepository = new DagInstanceRepositoryImpl(dbProvider) { override val profile = h2Profile }

  override def beforeAll: Unit = {
    schemaSetup()
  }

  override def afterAll: Unit = {
    schemaDrop()
  }

  override def afterEach: Unit = {
    clearData()
  }

  "dagInstanceRepository.getDagsToRun" should "return zero dag instances when db is empty" in {
    val runningWorkflowIds = Seq.empty[Long]
    val size = 10
    val result = await(dagInstanceRepository.getDagsToRun(runningWorkflowIds, size, Seq()))
    result.isEmpty shouldBe true
  }

  "dagInstanceRepository.getDagsToRun" should "return one running dag for each workflow" in {
    createTestData()
    val runningWorkflowIds = Seq.empty[Long]
    val allWorkflowIds = TestData.workflows.map(_.id)
    val size = 10
    val result = await(dagInstanceRepository.getDagsToRun(runningWorkflowIds, size, allWorkflowIds))
    result.size shouldBe 2
  }

  "dagInstanceRepository.getDagsToRun" should "filter out all dags" in {
    createTestData()
    val runningWorkflowIds = TestData.dagInstances.map(_.workflowId)
    val allWorkflowIds = TestData.workflows.map(_.id)
    val size = 10
    val result = await(dagInstanceRepository.getDagsToRun(runningWorkflowIds, size, allWorkflowIds))
    result.size shouldBe 0
  }

  "dagInstanceRepository.getDagsToRun" should "filter out running dags" in {
    createTestData()
    val runningWorkflowIds = TestData.runningDagInstances.map(_.workflowId)
    val allWorkflowIds = TestData.workflows.map(_.id)
    val size = 10
    val result = await(dagInstanceRepository.getDagsToRun(runningWorkflowIds, size, allWorkflowIds))
    result.foreach(_.status shouldBe DagInstanceStatuses.InQueue)
  }

  "dagInstanceRepository.getDagsToRun" should "return one running dag for each workflow with limited size" in {
    createTestData()
    val runningWorkflowIds = Seq.empty[Long]
    val allWorkflowIds = TestData.workflows.map(_.id)
    val size = 1
    val result = await(dagInstanceRepository.getDagsToRun(runningWorkflowIds, size, allWorkflowIds))
    result.size shouldBe 1
  }

  it should "only return dagInstances of assigned workflows" in {
    val workflowIds = 0L to 99L
    val baseWorkflow = Workflow(name = "workflow", isActive = true, project = "project", updated = None, version = 1)
    val baseDagInstance = DagInstance(DagInstanceStatuses.InQueue, "triggeredBy", -1L, LocalDateTime.now(), None)
    val workflows = workflowIds.map(i => baseWorkflow.copy(id = i, name = s"name$i"))
    val dagInstances = workflowIds.map(i => baseDagInstance.copy(workflowId = i, id = 1000 + i))
    run(workflowTable.forceInsertAll(workflows))
    run(dagInstanceTable.forceInsertAll(dagInstances))

    val runningWorkflowIds = Seq.empty[Long]
    val assignedWorkflowIds = workflowIds.take(10)
    val size = 1000

    val result = await(dagInstanceRepository.getDagsToRun(runningWorkflowIds, size, assignedWorkflowIds))
    result.size shouldBe 10
    result.map(_.workflowId) should contain theSameElementsAs assignedWorkflowIds
  }

  "dagInstanceRepository.hasRunningDagInstance" should "return true when workflow with running instance exists" in {
    createTestData()
    val result = await(dagInstanceRepository.hasRunningDagInstance(TestData.w1.id))
    result shouldBe true
  }

  "dagInstanceRepository.hasRunningDagInstance" should "return false when workflow with running instance does not exist" in {
    createTestData()
    val result = await(dagInstanceRepository.hasRunningDagInstance(TestData.w3.id))
    result shouldBe false
  }

  "dagInstanceRepository.hasInQueueDagInstance" should "return true when workflow with inQueue instance exists" in {
    createTestData()
    val result = await(dagInstanceRepository.hasInQueueDagInstance(TestData.w2.id))
    result shouldBe true
  }

  it should "return false when workflow with inQueue instance does not exist" in {
    createTestData()
    val result = await(dagInstanceRepository.hasInQueueDagInstance(TestData.w3.id))
    result shouldBe false
  }

  "dagInstanceRepository.countDagInstancesFrom" should "count dag instances from a certain datetime" in {
    createTestData()
    val result = await(dagInstanceRepository.countDagInstancesFrom(TestData.w1.id, LocalDateTime.now().minusMinutes(30L)))
    result shouldBe 2
  }
}
