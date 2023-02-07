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
import za.co.absa.hyperdrive.trigger.configuration.application.TestSchedulerConfig
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.enums.SchedulerInstanceStatuses
import za.co.absa.hyperdrive.trigger.persistance._

import java.time.Duration
import scala.concurrent.ExecutionContext.Implicits.global

class WorkflowBalancerIntegrationTest
    extends FlatSpec
    with Matchers
    with BeforeAndAfterAll
    with BeforeAndAfterEach
    with RepositoryH2TestBase {
  import api._

  private val schedulerInstanceRepository: SchedulerInstanceRepository = new SchedulerInstanceRepositoryImpl(
    dbProvider
  ) {
    override val profile = h2Profile
  }
  private val workflowHistoryRepository: WorkflowHistoryRepositoryImpl = new WorkflowHistoryRepositoryImpl(dbProvider) {
    override val profile = h2Profile
  }
  private val workflowRepository: WorkflowRepositoryImpl =
    new WorkflowRepositoryImpl(dbProvider, workflowHistoryRepository) {
      override val profile = h2Profile
    }

  private val schedulerInstanceService: SchedulerInstanceService = new SchedulerInstanceServiceImpl(
    schedulerInstanceRepository
  )
  private val workflowBalancingService: WorkflowBalancingService = new WorkflowBalancingServiceImpl(workflowRepository)
  private val schedulerConfig = TestSchedulerConfig()

  private val baseWorkflow =
    Workflow(name = "workflow", isActive = true, project = "project", updated = None, version = 1)
  private val random = new scala.util.Random(0)
  override def beforeAll: Unit =
    schemaSetup()

  override def afterAll: Unit =
    schemaDrop()

  override def afterEach: Unit =
    clearData()

  "WorkflowBalancer.getAssignedWorkflows" should "never double-assign a workflow and each workflow should be assigned " +
    "to exactly one scheduler after the steady state is reached. These conditions should hold, independent from any" +
    " workflow ids that are retained from previous iterations (because dags may still be running)" in {
      val balancer0 = new WorkflowBalancer(schedulerInstanceService, workflowBalancingService, schedulerConfig)
      val balancer1 = new WorkflowBalancer(schedulerInstanceService, workflowBalancingService, schedulerConfig)
      val balancer2 = new WorkflowBalancer(schedulerInstanceService, workflowBalancingService, schedulerConfig)
      val balancer3 = new WorkflowBalancer(schedulerInstanceService, workflowBalancingService, schedulerConfig)
      val workflowIds = 0L to 199L
      val workflows = workflowIds.map(i => baseWorkflow.copy(id = i, name = s"workflow$i"))
      run(workflowTable.forceInsertAll(workflows))
      def getRetainedIds(workflows: Seq[Workflow]) = getRandomSelection(workflows.map(_.id))

      // T0: Add one instance
      val workflowsB0T0 = await(balancer0.getAssignedWorkflows(Seq()))
      assertNoWorkflowIsDoubleAssigned(workflowsB0T0)

      // T1: Add three more instances and add more workflows
      val workflowsB1T1 = await(balancer1.getAssignedWorkflows(Seq()))
      assertNoWorkflowIsDoubleAssigned(workflowsB0T0, workflowsB1T1)
      run(workflowTable.forceInsert(baseWorkflow.copy(id = 1000, name = "workflow1000")))
      val workflowsB0T1 = await(balancer0.getAssignedWorkflows(Seq()))
      assertNoWorkflowIsDoubleAssigned(workflowsB0T1, workflowsB1T1)
      val workflowsB2T1 = await(balancer2.getAssignedWorkflows(Seq()))
      assertNoWorkflowIsDoubleAssigned(workflowsB0T1, workflowsB1T1, workflowsB2T1)
      val workflowsB3T1 = await(balancer3.getAssignedWorkflows(Seq()))
      assertNoWorkflowIsDoubleAssigned(workflowsB0T1, workflowsB1T1, workflowsB2T1, workflowsB3T1)

      // T2: Remove an instance and a workflow
      run(workflowTable.filter(_.id === 0L).delete)
      val maxId = await(db.run(schedulerInstanceTable.map(_.id).max.result)).get
      run(schedulerInstanceTable.filter(_.id === maxId).map(_.status).update(SchedulerInstanceStatuses.Deactivated))
      the[SchedulerInstanceAlreadyDeactivatedException] thrownBy await(balancer3.getAssignedWorkflows(Seq()))

      val workflowsB2T2 = await(balancer2.getAssignedWorkflows(getRetainedIds(workflowsB2T1)))
      assertNoWorkflowIsDoubleAssigned(workflowsB0T1, workflowsB1T1, workflowsB2T2)
      val workflowsB0T2 = await(balancer0.getAssignedWorkflows(getRetainedIds(workflowsB0T1)))
      assertNoWorkflowIsDoubleAssigned(workflowsB0T2, workflowsB1T1, workflowsB2T2)
      val workflowsB1T2 = await(balancer1.getAssignedWorkflows(getRetainedIds(workflowsB1T1)))
      assertNoWorkflowIsDoubleAssigned(workflowsB0T2, workflowsB1T2, workflowsB2T2)

      // T3: Steady state reached (w.r.t scheduler instances and workflows) => All workflows should be assigned
      val workflowsB0T3 = await(balancer0.getAssignedWorkflows(getRetainedIds(workflowsB0T2)))
      assertNoWorkflowIsDoubleAssigned(workflowsB0T3, workflowsB1T2, workflowsB2T2)
      val workflowsB1T3 = await(balancer1.getAssignedWorkflows(getRetainedIds(workflowsB1T2)))
      assertNoWorkflowIsDoubleAssigned(workflowsB0T3, workflowsB1T3, workflowsB2T2)
      val workflowsB2T3 = await(balancer2.getAssignedWorkflows(getRetainedIds(workflowsB2T2)))
      assertNoWorkflowIsDoubleAssigned(workflowsB0T3, workflowsB1T3, workflowsB2T3)
      assertNoWorkflowIsNotAssigned()
    }

  private def getRandomSelection[T](input: Seq[T]) =
    if (input.isEmpty) {
      Seq()
    } else {
      val selectionSize = random.nextInt(input.size)
      val selectionIndices = (0 to selectionSize).map(_ => random.nextInt(input.size))
      input.zipWithIndex
        .filter { case (_, index) => selectionIndices.contains(index) }
        .map(_._1)
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
