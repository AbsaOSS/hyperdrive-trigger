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

package za.co.absa.hyperdrive.trigger.api.rest.services

import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.models.{History, HistoryPair, WorkflowHistory, WorkflowJoined}
import za.co.absa.hyperdrive.trigger.persistance.{WorkflowHistoryRepository, WorkflowRepository}

import scala.concurrent.{ExecutionContext, Future}

trait WorkflowHistoryService {
  val workflowHistoryRepository: WorkflowHistoryRepository
  val workflowRepository: WorkflowRepository

  def getHistoryForWorkflow(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[History]]
  def getWorkflowFromHistory(workflowHistoryId: Long)(implicit ec: ExecutionContext): Future[WorkflowJoined]
  def getWorkflowsFromHistory(leftWorkflowHistoryId: Long, rightWorkflowHistoryId: Long)(implicit ec: ExecutionContext): Future[HistoryPair[WorkflowHistory]]
}

@Service
class WorkflowHistoryServiceImpl(
  override val workflowHistoryRepository: WorkflowHistoryRepository,
  override val workflowRepository: WorkflowRepository
) extends WorkflowHistoryService {

  override def getHistoryForWorkflow(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[History]] = {
    workflowHistoryRepository.getHistoryForWorkflow(workflowId)
  }

  override def getWorkflowFromHistory(workflowHistoryId: Long)(implicit ec: ExecutionContext): Future[WorkflowJoined] = {
    for {
      workflowFromHistory <- workflowHistoryRepository.getWorkflowFromHistory(workflowHistoryId)
      version <- workflowRepository.getWorkflowVersion(workflowFromHistory.id)
    } yield {
      workflowFromHistory.copy(version = version)
    }
  }

  override def getWorkflowsFromHistory(leftWorkflowHistoryId: Long, rightWorkflowHistoryId: Long)(implicit ec: ExecutionContext): Future[HistoryPair[WorkflowHistory]] = {
    workflowHistoryRepository.getWorkflowsFromHistory(leftWorkflowHistoryId, rightWorkflowHistoryId)
  }

}
