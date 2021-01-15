
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

import java.time.{Duration, LocalDateTime}

import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.{any, eq => eqTo}
import org.mockito.Mockito.{reset, times, verify, when, never}
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers}
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.enums.SchedulerInstanceStatuses

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ExecutionContext, Future}

class WorkflowBalancerTest extends AsyncFlatSpec with MockitoSugar with Matchers with BeforeAndAfter {
  private val schedulerInstanceService = mock[SchedulerInstanceService]
  private val workflowBalancingService = mock[WorkflowBalancingService]
  private val lagThresholdMillis = 20000L
  private val lagThreshold = Duration.ofMillis(lagThresholdMillis)
  private val baseWorkflow = Workflow(name = "workflow", isActive = true, project = "project", updated = None)

  before {
    reset(schedulerInstanceService)
    reset(workflowBalancingService)
  }

  "WorkflowBalancer.getAssignedWorkflows" should "invoke workflow balancing and cache the second invocation" in {
    // given
    val instance1 = SchedulerInstance(1, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    val instance2 = SchedulerInstance(2, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    val runningWorkflowIds = Seq(1L, 2L, 3L)
    val instances = Seq(instance1, instance2)
    val assignedWorkflows = Seq(
      baseWorkflow.copy(id = 11, schedulerInstanceId = Some(instance1.id)),
      baseWorkflow.copy(id = 12, schedulerInstanceId = Some(instance1.id)),
      baseWorkflow.copy(id = 13, schedulerInstanceId = Some(instance1.id))
    )
    val underTest = new WorkflowBalancer(schedulerInstanceService, workflowBalancingService, lagThresholdMillis)

    when(schedulerInstanceService.registerNewInstance()).thenReturn(Future{instance1.id})
    when(schedulerInstanceService.updateSchedulerStatus(any(), any())(any[ExecutionContext])).thenReturn(Future{instances})
    when(workflowBalancingService.getMaxWorkflowId()(any[ExecutionContext])).thenReturn(Future{Some(42L)})
    when(workflowBalancingService.getWorkflowsAssignment(any(), any(), any())(any[ExecutionContext])).thenReturn(
      Future{(assignedWorkflows, true)}
    )

    // when
    val result1 = await(underTest.getAssignedWorkflows(runningWorkflowIds))
    val result2 = await(underTest.getAssignedWorkflows(runningWorkflowIds))

    // then
    result1 should contain theSameElementsAs assignedWorkflows
    result2 should contain theSameElementsAs assignedWorkflows

    verify(schedulerInstanceService, times(1)).registerNewInstance()
    verify(schedulerInstanceService, times(2)).updateSchedulerStatus(eqTo(instance1.id), eqTo(lagThreshold))(any())
    verify(workflowBalancingService, times(2)).getMaxWorkflowId()
    verify(workflowBalancingService, times(1)).getWorkflowsAssignment(
      eqTo(runningWorkflowIds), eqTo(instances), eqTo(instance1.id))(any())
    succeed
  }

  it should "always invoke workflow balancing if the scheduler instances have changed" in {
    // given
    val instance1 = SchedulerInstance(1, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    val instance2 = SchedulerInstance(2, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    val instance3 = SchedulerInstance(3, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    val instancesT1 = Seq(instance1, instance2)
    val instancesT2 = Seq(instance1, instance2.copy(status = SchedulerInstanceStatuses.Deactivated))
    val instancesT3 = Seq(instance3)
    val runningWorkflowIds = Seq()

    val assignedWorkflowsT1 = Seq(baseWorkflow.copy(id = 11, schedulerInstanceId = Some(instance1.id)))
    val assignedWorkflowsT2 = Seq(baseWorkflow.copy(id = 21, schedulerInstanceId = Some(instance1.id)))
    val assignedWorkflowsT3 = Seq(baseWorkflow.copy(id = 31, schedulerInstanceId = Some(instance1.id)))

    val underTest = new WorkflowBalancer(schedulerInstanceService, workflowBalancingService, lagThresholdMillis)

    when(schedulerInstanceService.registerNewInstance()).thenReturn(Future{instance1.id})
    when(schedulerInstanceService.updateSchedulerStatus(any(), any())(any[ExecutionContext])).thenReturn(
      Future{instancesT1}, Future{instancesT2}, Future{instancesT3})
    when(workflowBalancingService.getMaxWorkflowId()(any[ExecutionContext])).thenReturn(Future{Some(42L)})
    when(workflowBalancingService.getWorkflowsAssignment(any(), any(), any())(any[ExecutionContext])).thenReturn(
      Future{(assignedWorkflowsT1, true)}, Future{(assignedWorkflowsT2, true)}, Future{(assignedWorkflowsT3, true)}
    )

    // when
    val result1 = await(underTest.getAssignedWorkflows(runningWorkflowIds))
    val result2 = await(underTest.getAssignedWorkflows(runningWorkflowIds))
    val result3 = await(underTest.getAssignedWorkflows(runningWorkflowIds))

    // then
    result1 should contain theSameElementsAs assignedWorkflowsT1
    result2 should contain theSameElementsAs assignedWorkflowsT2
    result3 should contain theSameElementsAs assignedWorkflowsT3

    val instancesCaptor: ArgumentCaptor[Seq[SchedulerInstance]] = ArgumentCaptor.forClass(classOf[Seq[SchedulerInstance]])
    verify(workflowBalancingService, times(3)).getWorkflowsAssignment(
      eqTo(runningWorkflowIds), instancesCaptor.capture(), eqTo(instance1.id))(any())

    import scala.collection.JavaConverters._
    instancesCaptor.getAllValues.asScala should contain theSameElementsInOrderAs Seq(instancesT1, instancesT2, instancesT3)
  }

  it should "always invoke workflow balancing if a workflow was added" in {
    // given
    val instance1 = SchedulerInstance(1, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    val instance2 = SchedulerInstance(2, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    val runningWorkflowIds = Seq(1L, 2L, 3L)
    val instances = Seq(instance1, instance2)
    val assignedWorkflowsT1 = Seq(baseWorkflow.copy(id = 11, schedulerInstanceId = Some(instance1.id)))
    val assignedWorkflowsT2 = Seq(baseWorkflow.copy(id = 21, schedulerInstanceId = Some(instance1.id)))
    val assignedWorkflowsT3 = Seq(baseWorkflow.copy(id = 31, schedulerInstanceId = Some(instance1.id)))

    val underTest = new WorkflowBalancer(schedulerInstanceService, workflowBalancingService, lagThresholdMillis)

    when(schedulerInstanceService.registerNewInstance()).thenReturn(Future{instance1.id})
    when(schedulerInstanceService.updateSchedulerStatus(any(), any())(any[ExecutionContext])).thenReturn(Future{instances})
    when(workflowBalancingService.getMaxWorkflowId()(any[ExecutionContext])).thenReturn(
      Future{Some(42L)},
      Future{Some(41L)},
      Future{Some(43L)}
    )
    when(workflowBalancingService.getWorkflowsAssignment(any(), any(), any())(any[ExecutionContext])).thenReturn(
      Future{(assignedWorkflowsT1, true)}, Future{(assignedWorkflowsT2, true)}, Future{(assignedWorkflowsT3, true)}
    )

    // when
    val result1 = await(underTest.getAssignedWorkflows(runningWorkflowIds))
    val result2 = await(underTest.getAssignedWorkflows(runningWorkflowIds))
    val result3 = await(underTest.getAssignedWorkflows(runningWorkflowIds))

    // then
    result1 should contain theSameElementsAs assignedWorkflowsT1
    result2 should contain theSameElementsAs assignedWorkflowsT2
    result3 should contain theSameElementsAs assignedWorkflowsT3

    verify(workflowBalancingService, times(3)).getWorkflowsAssignment(
      eqTo(runningWorkflowIds), eqTo(instances), eqTo(instance1.id))(any())
    succeed
  }

  it should "always invoke workflow balancing if not all target workflows could be acquired" in {
    // given
    val instance1 = SchedulerInstance(1, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    val instance2 = SchedulerInstance(2, SchedulerInstanceStatuses.Active, LocalDateTime.now())
    val runningWorkflowIds = Seq(1L, 2L, 3L)
    val instances = Seq(instance1, instance2)
    val assignedWorkflows = Seq(baseWorkflow.copy(id = 11, schedulerInstanceId = Some(instance1.id)))

    val underTest = new WorkflowBalancer(schedulerInstanceService, workflowBalancingService, lagThresholdMillis)

    when(schedulerInstanceService.registerNewInstance()).thenReturn(Future{instance1.id})
    when(schedulerInstanceService.updateSchedulerStatus(any(), any())(any[ExecutionContext])).thenReturn(Future{instances})
    when(workflowBalancingService.getMaxWorkflowId()(any[ExecutionContext])).thenReturn(Future{Some(42L)})
    when(workflowBalancingService.getWorkflowsAssignment(any(), any(), any())(any[ExecutionContext])).thenReturn(
      Future{(assignedWorkflows, false)}, Future{(assignedWorkflows, false)}, Future{(assignedWorkflows, true)}
    )

    // when
    val result1 = await(underTest.getAssignedWorkflows(runningWorkflowIds))
    val result2 = await(underTest.getAssignedWorkflows(runningWorkflowIds))
    val result3 = await(underTest.getAssignedWorkflows(runningWorkflowIds))

    // then
    result1 should contain theSameElementsAs assignedWorkflows
    result2 should contain theSameElementsAs assignedWorkflows
    result3 should contain theSameElementsAs assignedWorkflows

    verify(workflowBalancingService, times(3)).getWorkflowsAssignment(
      eqTo(runningWorkflowIds), eqTo(instances), eqTo(instance1.id))(any())
    succeed
  }

  it should "fail if updateSchedulerStatus fails" in {
    // given
    val underTest = new WorkflowBalancer(schedulerInstanceService, workflowBalancingService, lagThresholdMillis)
    when(schedulerInstanceService.registerNewInstance()).thenReturn(Future{42L})
    when(schedulerInstanceService.updateSchedulerStatus(any(), any())(any[ExecutionContext])).thenReturn(
      Future.failed(new SchedulerInstanceAlreadyDeactivatedException))

    // when
    the[SchedulerInstanceAlreadyDeactivatedException] thrownBy await(underTest.getAssignedWorkflows(Seq()))

    // then
    verify(workflowBalancingService, never).getMaxWorkflowId()(any[ExecutionContext])
    verify(workflowBalancingService, never).getWorkflowsAssignment(any(), any(), any())(any[ExecutionContext]())
    succeed
  }
}
