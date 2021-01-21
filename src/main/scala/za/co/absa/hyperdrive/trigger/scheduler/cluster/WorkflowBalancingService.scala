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
import za.co.absa.hyperdrive.trigger.models.enums.SchedulerInstanceStatuses
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
    val activeInstances = instances.filter(_.status == SchedulerInstanceStatuses.Active)
    val myRank = getRank(activeInstances, myInstanceId)
    logger.info(s"Rebalancing workflows on scheduler instance id = $myInstanceId, rank = $myRank," +
      s" active instance ids = ${activeInstances.map(_.id).sorted}, retaining workflow ids = ${runningWorkflowIds}")
    for {
      (releasedWorkflowsCount, instancesDeletedCount) <- workflowRepository.releaseWorkflowAssignmentsOfDeactivatedInstances()
      _ = if (releasedWorkflowsCount > 0) {
        logger.info(s"Scheduler instance id = $myInstanceId released $releasedWorkflowsCount workflows of " +
          s"$instancesDeletedCount deactivated instances")
      }
      allWorkflows <- workflowRepository.getWorkflows()
      targetWorkflowIds = allWorkflows.filter(_.id % activeInstances.size == myRank).map(_.id)
      workflowIdsToAcquire = (targetWorkflowIds ++ runningWorkflowIds).distinct
      currentAssignedWorkflowIds = allWorkflows
        .filter(_.schedulerInstanceId.isDefined)
        .filter(_.schedulerInstanceId.get == myInstanceId)
        .map(_.id)
      workflowIdsToRelease = currentAssignedWorkflowIds.diff(workflowIdsToAcquire)
      _ <- workflowRepository.releaseWorkflowAssignments(workflowIdsToRelease, myInstanceId)
      _ <- workflowRepository.acquireWorkflowAssignments(workflowIdsToAcquire, myInstanceId)
      acquiredWorkflows <- workflowRepository.getWorkflowsBySchedulerInstance(myInstanceId)
    } yield {
      val acquiredWorkflowIds = acquiredWorkflows.map(_.id)
      val targetWorkflowAssignmentReached = acquiredWorkflowIds.toSet == targetWorkflowIds.toSet
      logger.debug(s"Scheduler instance id = $myInstanceId acquired workflow ids ${acquiredWorkflowIds.sorted}" +
        s" with missing target workflow ids = ${targetWorkflowIds.diff(acquiredWorkflowIds).sorted}")
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
