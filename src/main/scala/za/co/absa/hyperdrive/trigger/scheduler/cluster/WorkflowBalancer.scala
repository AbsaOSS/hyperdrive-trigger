
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

import java.time.Duration

import javax.inject.Inject
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.models.enums.SchedulerInstanceStatuses.SchedulerInstanceStatus
import za.co.absa.hyperdrive.trigger.models.{SchedulerInstance, Workflow}

import scala.concurrent.{ExecutionContext, Future}

@Component
class WorkflowBalancer @Inject()(schedulerInstanceService: SchedulerInstanceService,
                                 workflowBalancingService: WorkflowBalancingService,
                                 @Value("${scheduler.lag.threshold:20000}") lagThresholdMillis: Long) {
  case class SchedulerIdStatus(id: Long, status: SchedulerInstanceStatus)
  private val logger = LoggerFactory.getLogger(this.getClass)

  private var schedulerInstanceId: Option[Long] = None
  private var previousInstancesIdStatus: Set[SchedulerIdStatus] = Set()
  private var previousAssignedWorkflows: Seq[Workflow] = Seq()
  private var targetWorkflowAssignmentReached = false
  private var previousMaxWorkflowId: Option[Long] = None

  def getAssignedWorkflows(runningWorkflowIds: Iterable[Long])(implicit ec: ExecutionContext): Future[Seq[Workflow]] = {
    val lagThreshold = Duration.ofMillis(lagThresholdMillis)
    for {
      instanceId <- getOrCreateInstance
      instances <- schedulerInstanceService.updateSchedulerStatus(instanceId, lagThreshold)
      _ = logger.debug(s"Scheduler instance $instanceId observed all instance ids = ${instances.map(_.id).sorted}")
      instancesIdStatus = instances.map(s => SchedulerIdStatus(s.id, s.status)).toSet
      isInstancesSteady = instancesIdStatus == previousInstancesIdStatus
      maxWorkflowId <- workflowBalancingService.getMaxWorkflowId()
      isWorkflowsSteady = maxWorkflowId.isDefined && previousMaxWorkflowId == maxWorkflowId
      _ = logger.debug(s"Scheduler instance $instanceId observed maxWorkflowId = $maxWorkflowId")
      (workflows, targetReachedValue) <- if (isInstancesSteady && isWorkflowsSteady && targetWorkflowAssignmentReached) {
        Future { (previousAssignedWorkflows, targetWorkflowAssignmentReached) }
      } else {
        workflowBalancingService.getWorkflowsAssignment(runningWorkflowIds, instances, instanceId)
      }
    } yield {
      previousInstancesIdStatus = instancesIdStatus
      previousMaxWorkflowId = maxWorkflowId
      targetWorkflowAssignmentReached = targetReachedValue
      previousAssignedWorkflows = workflows
      workflows
    }
  }

  def resetSchedulerInstanceId(): Unit = {
    schedulerInstanceId = None
  }

  private def getOrCreateInstance()(implicit ec: ExecutionContext) = {
    schedulerInstanceId match {
      case Some(id) => Future{id}
      case None => schedulerInstanceService.registerNewInstance()
        .map { id => schedulerInstanceId = Some(id)
          logger.info(s"Registered new scheduler instance with id = $id")
          id
        }
    }
  }
}

