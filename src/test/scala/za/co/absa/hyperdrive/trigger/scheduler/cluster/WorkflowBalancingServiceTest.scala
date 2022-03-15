
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

import java.time.LocalDateTime

import org.mockito.ArgumentMatchers.{any, eq => eqTo}
import org.mockito.Mockito.{reset, verify, when}
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.enums.SchedulerInstanceStatuses
import za.co.absa.hyperdrive.trigger.persistance.WorkflowRepository

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ExecutionContext, Future}

class WorkflowBalancingServiceTest extends FlatSpec with MockitoSugar with Matchers with BeforeAndAfter {
  private val workflowRepository = mock[WorkflowRepository]
  private val underTest = new WorkflowBalancingServiceImpl(workflowRepository)
  private val baseWorkflow = Workflow(name = "workflow", isActive = true, project = "project", updated = None, version = 1)

  before {
    reset(workflowRepository)
  }

  "WorkflowBalancingService.getWorkflowsAssignment" should "balance workflows according to ids" in {
    // given
    val instance1 = SchedulerInstance(2, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    val instance2 = SchedulerInstance(4, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    val instance3 = SchedulerInstance(100, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    val instance4 = SchedulerInstance(101, SchedulerInstanceStatuses.Deactivated, LocalDateTime.now())
    val myInstanceId = instance1.id
    val runningWorkflowIds = Seq()
    val instances = Seq(instance1, instance2, instance3, instance4)
    val workflows = Seq(
      baseWorkflow.copy(id = 1, schedulerInstanceId = Some(myInstanceId)),
      baseWorkflow.copy(id = 2, schedulerInstanceId = Some(myInstanceId)),
      baseWorkflow.copy(id = 3, schedulerInstanceId = Some(myInstanceId)),
      baseWorkflow.copy(id = 4, schedulerInstanceId = Some(instance2.id)),
      baseWorkflow.copy(id = 5, schedulerInstanceId = Some(instance2.id)),
      baseWorkflow.copy(id = 6, schedulerInstanceId = Some(instance2.id))
    )
    val myTargetWorkflows = workflows.filter(w => w.id == 3L || w.id == 6L)

    when(workflowRepository.releaseWorkflowAssignmentsOfDeactivatedInstances()(any[ExecutionContext])).thenReturn(Future{(0, 0)})
    when(workflowRepository.getWorkflows()(any[ExecutionContext])).thenReturn(Future{workflows})
    when(workflowRepository.releaseWorkflowAssignments(any(), any())(any[ExecutionContext])).thenReturn(Future{0})
    when(workflowRepository.acquireWorkflowAssignments(any(), any())(any[ExecutionContext])).thenReturn(Future{0})
    when(workflowRepository.getWorkflowsBySchedulerInstance(eqTo(myInstanceId))(any[ExecutionContext])).thenReturn(
      Future{myTargetWorkflows}
    )

    // when
    val result = await(underTest.getWorkflowsAssignment(runningWorkflowIds, instances, myInstanceId))

    // then
    result._1 should contain theSameElementsAs myTargetWorkflows
    result._2 shouldBe true

    verify(workflowRepository).releaseWorkflowAssignmentsOfDeactivatedInstances()
    verify(workflowRepository).getWorkflows()(any())
    verify(workflowRepository).releaseWorkflowAssignments(eqTo(Seq(1L, 2L)), eqTo(myInstanceId))(any())
    verify(workflowRepository).acquireWorkflowAssignments(eqTo(Seq(3L, 6L)), eqTo(myInstanceId))(any())
  }

  it should "not release running workflows and then return false" in {
    // given
    val instance1 = SchedulerInstance(2, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    val instance2 = SchedulerInstance(4, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    val instance3 = SchedulerInstance(6, SchedulerInstanceStatuses.Deactivated, LocalDateTime.now())
    val myInstanceId = instance2.id
    val runningWorkflowIds = Seq(4L, 5L)
    val instances = Seq(instance1, instance2, instance3)
    val workflows = Seq(
      baseWorkflow.copy(id = 1, schedulerInstanceId = None),
      baseWorkflow.copy(id = 2, schedulerInstanceId = Some(instance1.id)),
      baseWorkflow.copy(id = 3, schedulerInstanceId = Some(instance1.id)),
      baseWorkflow.copy(id = 4, schedulerInstanceId = Some(myInstanceId)),
      baseWorkflow.copy(id = 5, schedulerInstanceId = Some(myInstanceId)),
      baseWorkflow.copy(id = 6, schedulerInstanceId = Some(myInstanceId))
    )
    val myTargetWorkflows = workflows.filter(w => Seq(1L, 3L, 4L, 5L).contains(w.id))

    when(workflowRepository.releaseWorkflowAssignmentsOfDeactivatedInstances()(any[ExecutionContext])).thenReturn(Future{(0, 0)})
    when(workflowRepository.getWorkflows()(any[ExecutionContext])).thenReturn(Future{workflows})
    when(workflowRepository.releaseWorkflowAssignments(any(), any())(any[ExecutionContext])).thenReturn(Future{0})
    when(workflowRepository.acquireWorkflowAssignments(any(), any())(any[ExecutionContext])).thenReturn(Future{0})
    when(workflowRepository.getWorkflowsBySchedulerInstance(eqTo(myInstanceId))(any[ExecutionContext])).thenReturn(
      Future{myTargetWorkflows}
    )

    // when
    val result = await(underTest.getWorkflowsAssignment(runningWorkflowIds, instances, myInstanceId))

    // then
    result._1 should contain theSameElementsAs myTargetWorkflows
    result._2 shouldBe false

    verify(workflowRepository).releaseWorkflowAssignmentsOfDeactivatedInstances()
    verify(workflowRepository).getWorkflows()(any())
    verify(workflowRepository).releaseWorkflowAssignments(eqTo(Seq(6L)), eqTo(myInstanceId))(any())
    verify(workflowRepository).acquireWorkflowAssignments(eqTo(Seq(1L, 3L, 5L, 4L)), eqTo(myInstanceId))(any())
  }

  it should "return false if not all target workflows could be acquired" in {
    // given
    val instance1 = SchedulerInstance(2, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    val instance2 = SchedulerInstance(4, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    val instance3 = SchedulerInstance(6, SchedulerInstanceStatuses.Deactivated, LocalDateTime.now())
    val myInstanceId = instance1.id
    val runningWorkflowIds = Seq()
    val instances = Seq(instance1, instance2, instance3)
    val workflows = Seq(
      baseWorkflow.copy(id = 1, schedulerInstanceId = Some(myInstanceId)),
      baseWorkflow.copy(id = 2, schedulerInstanceId = Some(myInstanceId)),
      baseWorkflow.copy(id = 3, schedulerInstanceId = Some(myInstanceId)),
      baseWorkflow.copy(id = 4, schedulerInstanceId = None),
      baseWorkflow.copy(id = 5, schedulerInstanceId = None),
      baseWorkflow.copy(id = 6, schedulerInstanceId = None)
    )

    when(workflowRepository.releaseWorkflowAssignmentsOfDeactivatedInstances()(any[ExecutionContext])).thenReturn(Future{(0, 0)})
    when(workflowRepository.getWorkflows()(any[ExecutionContext])).thenReturn(Future{workflows})
    when(workflowRepository.releaseWorkflowAssignments(any(), any())(any[ExecutionContext])).thenReturn(Future{0})
    when(workflowRepository.acquireWorkflowAssignments(any(), any())(any[ExecutionContext])).thenReturn(Future{0})
    when(workflowRepository.getWorkflowsBySchedulerInstance(eqTo(myInstanceId))(any[ExecutionContext])).thenReturn(
      Future{workflows.filter(_.id == 2)}
    )

    // when
    val result = await(underTest.getWorkflowsAssignment(runningWorkflowIds, instances, myInstanceId))

    // then
    result._1 should contain theSameElementsAs workflows.filter(_.id == 2)
    result._2 shouldBe false

    verify(workflowRepository).releaseWorkflowAssignmentsOfDeactivatedInstances()
    verify(workflowRepository).getWorkflows()(any())
    verify(workflowRepository).releaseWorkflowAssignments(eqTo(Seq(1L, 3L)), eqTo(myInstanceId))(any())
    verify(workflowRepository).acquireWorkflowAssignments(eqTo(Seq(2L, 4L, 6L)), eqTo(myInstanceId))(any())
  }
}
