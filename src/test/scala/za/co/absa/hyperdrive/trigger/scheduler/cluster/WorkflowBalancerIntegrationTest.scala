
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

package za.co.absa.hyperdrive.trigger.scheduler.cluster

import org.scalatest._
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.enums.SchedulerInstanceStatuses
import za.co.absa.hyperdrive.trigger.persistance._

import scala.concurrent.ExecutionContext.Implicits.global


class WorkflowBalancerIntegrationTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with RepositoryTestBase {
  import h2Profile.api._

  private val schedulerInstanceRepository: SchedulerInstanceRepository = new SchedulerInstanceRepositoryImpl {
    override val profile = h2Profile
  }
  private val workflowHistoryRepository: WorkflowHistoryRepositoryImpl = new WorkflowHistoryRepositoryImpl {
    override val profile = h2Profile
  }
  private val workflowRepository: WorkflowRepositoryImpl = new WorkflowRepositoryImpl(workflowHistoryRepository) {
    override val profile = h2Profile
  }

  private val schedulerInstanceService: SchedulerInstanceService = new SchedulerInstanceServiceImpl(schedulerInstanceRepository)
  private val workflowBalancingService: WorkflowBalancingService = new WorkflowBalancingServiceImpl(workflowRepository)
  private val lagThresholdMillis = 20000L

  private val baseWorkflow = Workflow(name = "workflow", isActive = true, project = "project", updated = None)
  private val random = new scala.util.Random(0)
  override def beforeAll: Unit = {
    h2SchemaSetup()
  }

  override def afterAll: Unit = {
    h2SchemaDrop()
  }

  override def afterEach: Unit = {
    clearData()
  }

  "WorkflowBalancer.getAssignedWorkflows" should "never double-assign a workflow and each workflow should be assigned " +
    "to exactly one scheduler after the steady state is reached. These conditions should hold, independent from any" +
    "extra workflow ids" in {
    val balancer0 = new WorkflowBalancer(schedulerInstanceService, workflowBalancingService, lagThresholdMillis)
    val balancer1 = new WorkflowBalancer(schedulerInstanceService, workflowBalancingService, lagThresholdMillis)
    val balancer2 = new WorkflowBalancer(schedulerInstanceService, workflowBalancingService, lagThresholdMillis)
    val workflowIds = 0L to 199L
    val workflows = workflowIds.map(i => baseWorkflow.copy(id = i, name = s"workflow$i"))
    run(workflowTable.forceInsertAll(workflows))
    def getRandomExtraWorkflowIds = getRandomSelection(workflowIds, 3)

    // T0: Add one instance
    val workflowsB0T0 = await(balancer0.getAssignedWorkflows(Seq()))
    assertNoWorkflowIsDoubleAssigned(workflowsB0T0)

    // T1: Add two more instances and add more workflows
    val extraWorkflowIdsT1 = getRandomExtraWorkflowIds
    val workflowsB1T1 = await(balancer1.getAssignedWorkflows(extraWorkflowIdsT1(1)))
    assertNoWorkflowIsDoubleAssigned(workflowsB0T0, workflowsB1T1)
    run(workflowTable.forceInsert(baseWorkflow.copy(id = 1000, name = "workflow1000")))
    val workflowsB0T1 = await(balancer0.getAssignedWorkflows(extraWorkflowIdsT1(0)))
    assertNoWorkflowIsDoubleAssigned(workflowsB0T1, workflowsB1T1)
    val workflowsB2T1 = await(balancer2.getAssignedWorkflows(extraWorkflowIdsT1(2)))
    assertNoWorkflowIsDoubleAssigned(workflowsB0T1, workflowsB1T1, workflowsB2T1)

    // T2: No intermediate changes in workflows or scheduler instances
    run(workflowTable.forceInsert(baseWorkflow.copy(id = 1001, name = "workflow1001")))
    val extraWorkflowIdsT2 = getRandomExtraWorkflowIds
    val workflowsB2T2 = await(balancer2.getAssignedWorkflows(extraWorkflowIdsT2(2)))
    assertNoWorkflowIsDoubleAssigned(workflowsB0T1, workflowsB1T1, workflowsB2T2)
    val workflowsB0T2 = await(balancer0.getAssignedWorkflows(extraWorkflowIdsT2(0)))
    assertNoWorkflowIsDoubleAssigned(workflowsB0T2, workflowsB1T1, workflowsB2T2)
    val workflowsB1T2 = await(balancer1.getAssignedWorkflows(extraWorkflowIdsT2(1)))
    assertNoWorkflowIsDoubleAssigned(workflowsB0T2, workflowsB1T2, workflowsB2T2)

    // T3: Steady state reached (w.r.t scheduler instances and workflows) => All workflows should be assigned
    val extraWorkflowIdsT3 = getRandomExtraWorkflowIds
    val workflowsB0T3 = await(balancer0.getAssignedWorkflows(extraWorkflowIdsT3(0)))
    assertNoWorkflowIsDoubleAssigned(workflowsB0T3, workflowsB1T2, workflowsB2T2)
    val workflowsB1T3 = await(balancer1.getAssignedWorkflows(extraWorkflowIdsT3(1)))
    assertNoWorkflowIsDoubleAssigned(workflowsB0T3, workflowsB1T3, workflowsB2T2)
    val workflowsB2T3 = await(balancer2.getAssignedWorkflows(extraWorkflowIdsT3(2)))
    assertNoWorkflowIsDoubleAssigned(workflowsB0T3, workflowsB1T3, workflowsB2T3)
    assertNoWorkflowIsNotAssigned()

    // T3: Remove one instance
    val maxId = await(db.run(schedulerInstanceTable.map(_.id).max.result)).get
    run(schedulerInstanceTable.filter(_.id === maxId).map(_.status).update(SchedulerInstanceStatuses.Deactivated))
    val extraWorkflowIdsT4 = getRandomExtraWorkflowIds
    the [SchedulerInstanceAlreadyDeactivatedException] thrownBy await(balancer2.getAssignedWorkflows(extraWorkflowIdsT4(2)))
    val workflowsB0T4 = await(balancer0.getAssignedWorkflows(extraWorkflowIdsT4(0)))
    assertNoWorkflowIsDoubleAssigned(workflowsB0T4, workflowsB1T3)
    val workflowsB1T4 = await(balancer1.getAssignedWorkflows(extraWorkflowIdsT4(1)))
    assertNoWorkflowIsDoubleAssigned(workflowsB0T4, workflowsB1T4)
  }

  /**
   *
   * @param input an arbitrary sequence
   * @param slices number of elements of the outer output sequence
   * @return
   * Example: input = (5, 3, 7, 9, 8, 6, 5) and slices = 3 could return
   * ((5, 3), (), (7, 9, 8)) or ((5, 3, 7), (9, 8), (6)), etc.
   */
  private def getRandomSelection[T](input: Seq[T], slices: Int) = {
    val selectionSize = random.nextInt(input.size)
    val selectionIndices = (0 to selectionSize).map(_ => random.nextInt(input.size))
    val selection = input.zipWithIndex
      .filter{ case (_, index) => selectionIndices.contains(index) }
      .map(_._1)

    val sliceIndices = (0 until slices).map(_ => random.nextInt(input.size)).sorted
    (0 +: sliceIndices).zip(sliceIndices :+ input.size)
      .map{ case (from, to) => selection.slice(from, to) }
  }

  private def assertNoWorkflowIsDoubleAssigned(workflows: Seq[Workflow]*) = {
    val flatWorkflows = workflows.flatten
    flatWorkflows.size shouldBe flatWorkflows.distinct.size
  }

  private def assertNoWorkflowIsNotAssigned() = {
    val result = await(db.run(workflowTable.filter(w => w.schedulerInstanceId.isEmpty).result))
    result shouldBe empty
  }

}
