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

import javax.inject.Inject
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.models.{SchedulerInstance, Workflow}
import za.co.absa.hyperdrive.trigger.persistance.WorkflowRepository

import scala.concurrent.{ExecutionContext, Future}

trait WorkflowBalancingService {

  def getWorkflowsAssignment(runningWorkflowIds: Iterable[Long], instances: Seq[SchedulerInstance], myInstanceId: Long)
                            (implicit ec: ExecutionContext): Future[(Seq[Workflow], Boolean)]

  def getMaxWorkflowId()(implicit ec: ExecutionContext): Future[Option[Long]]
}

@Service
class WorkflowBalancingServiceImpl @Inject()(workflowRepository: WorkflowRepository) extends WorkflowBalancingService {
  private val logger = LoggerFactory.getLogger(this.getClass)

  override def getWorkflowsAssignment(runningWorkflowIds: Iterable[Long], instances: Seq[SchedulerInstance], myInstanceId: Long)
                                     (implicit ec: ExecutionContext): Future[(Seq[Workflow], Boolean)] = {
    val myRank = getRank(instances, myInstanceId)
    logger.info(s"Rebalancing workflows on scheduler instance id = $myInstanceId, rank = $myRank," +
      s" all instance ids = ${instances.map(_.id).sorted}, retaining workflow ids = ${runningWorkflowIds}")
    for {
      droppedWorkflowsCount <- workflowRepository.dropWorkflowAssignmentsOfDeactivatedInstances()
      _ = if (droppedWorkflowsCount > 0) {
        logger.info(s"Scheduler instance id = $myInstanceId dropped $droppedWorkflowsCount workflows of deactivated instances")
      }
      allWorkflows <- workflowRepository.getWorkflows()
      targetWorkflowIds = allWorkflows.filter(_.id % instances.size == myRank).map(_.id)
      workflowIdsToAcquire = (targetWorkflowIds ++ runningWorkflowIds).distinct
      currentAssignedWorkflowIds = allWorkflows
        .filter(_.schedulerInstanceId.isDefined)
        .filter(_.schedulerInstanceId.get == myInstanceId)
        .map(_.id)
      workflowIdsToDrop = currentAssignedWorkflowIds.diff(workflowIdsToAcquire)
      _ <- workflowRepository.dropWorkflowAssignments(workflowIdsToDrop, myInstanceId)
      _ <- workflowRepository.acquireWorkflowAssignments(workflowIdsToAcquire, myInstanceId)
      acquiredWorkflows <- workflowRepository.getWorkflowsBySchedulerInstance(myInstanceId)
    } yield {
      val targetWorkflowAssignmentReached = acquiredWorkflows.map(_.id).equals(targetWorkflowIds)
      logger.debug(s"Scheduler instance id = $myInstanceId acquired workflow ids ${acquiredWorkflows.map(_.id).sorted}" +
        s" with target workflow ids = ${targetWorkflowIds.sorted}")
      (acquiredWorkflows, targetWorkflowAssignmentReached)
    }
  }

  override def getMaxWorkflowId()(implicit ec: ExecutionContext): Future[Option[Long]] = {
    workflowRepository.getMaxWorkflowId
  }

  private def getRank(instances: Seq[SchedulerInstance], myInstanceId: Long): Int = {
    val idRankMap = instances
      .sortBy(_.id)
      .zipWithIndex
      .map { case (instance, index) => instance.id -> index }
      .toMap
    idRankMap.getOrElse(myInstanceId, throw new NoSuchElementException(s"Could not find instanceId $myInstanceId in $idRankMap"))
  }

}