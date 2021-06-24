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

import org.springframework.stereotype
import za.co.absa.hyperdrive.trigger.models.enums.DBOperation.{Create, DBOperation, Delete, Update}
import za.co.absa.hyperdrive.trigger.models._

import scala.concurrent.{ExecutionContext, Future}

trait WorkflowHistoryRepository extends Repository {
  import slick.dbio.DBIO

  private[persistance] def create(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Long]
  private[persistance] def update(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Long]
  private[persistance] def delete(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Long]

  def getHistoryForWorkflow(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[History]]
  def getWorkflowsFromHistory(leftWorkflowHistoryId: Long, rightWorkflowHistoryId: Long)(implicit ec: ExecutionContext): Future[HistoryPair[WorkflowHistory]]
}

@stereotype.Repository
class WorkflowHistoryRepositoryImpl extends WorkflowHistoryRepository {
  import api._

  private def insert(workflow: WorkflowJoined, user: String, operation: DBOperation)(implicit ec: ExecutionContext): DBIO[Long] = {
    val workflowHistory = WorkflowHistory(
      history = History(
        changedOn = LocalDateTime.now(),
        changedBy = user,
        operation = operation
      ),
      workflowId = workflow.id,
      workflow = workflow
    )
    workflowHistoryTable returning workflowHistoryTable.map(_.id) += workflowHistory
  }

  override private[persistance] def create(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Long] = {
    this.insert(workflow, user, Create)
  }

  override private[persistance] def update(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Long] = {
    this.insert(workflow, user, Update)
  }

  override private[persistance] def delete(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Long] = {
    this.insert(workflow, user, Delete)
  }

  override def getHistoryForWorkflow(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[History]] = {
    db.run(workflowHistoryTable.getHistoryForEntity(workflowId))
  }

  override def getWorkflowsFromHistory(leftWorkflowHistoryId: Long, rightWorkflowHistoryId: Long)(implicit ec: ExecutionContext): Future[HistoryPair[WorkflowHistory]] = {
    db.run(workflowHistoryTable.getEntitiesFromHistory(leftWorkflowHistoryId, rightWorkflowHistoryId))
  }
}
