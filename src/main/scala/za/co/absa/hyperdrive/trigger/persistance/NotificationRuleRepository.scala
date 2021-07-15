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

import org.slf4j.LoggerFactory
import org.springframework.stereotype
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses.{DagInstanceStatus, dagInstanceStatus2String}
import za.co.absa.hyperdrive.trigger.models.errors.{ApiException, GenericDatabaseError, ValidationError}
import za.co.absa.hyperdrive.trigger.models.search.{TableSearchRequest, TableSearchResponse}

import java.time.LocalDateTime
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

trait NotificationRuleRepository extends Repository {
  val notificationRuleHistoryRepository: NotificationRuleHistoryRepository

  def insertNotificationRule(notificationRule: NotificationRule, user: String)(implicit ec: ExecutionContext): Future[Long]

  def getNotificationRule(id: Long)(implicit ec: ExecutionContext): Future[NotificationRule]

  def getNotificationRules()(implicit ec: ExecutionContext): Future[Seq[NotificationRule]]

  def updateNotificationRule(notificationRule: NotificationRule, user: String)(implicit ec: ExecutionContext): Future[Unit]

  def deleteNotificationRule(id: Long, user: String)(implicit ec: ExecutionContext): Future[Unit]

  def searchNotificationRules(tableSearchRequest: TableSearchRequest)(implicit ec: ExecutionContext): Future[TableSearchResponse[NotificationRule]]

  def getMatchingNotificationRules(workflowId: Long, status: DagInstanceStatus, currentTime: LocalDateTime)(implicit ec: ExecutionContext): Future[(Seq[NotificationRule], Workflow)]

}

@stereotype.Repository
class NotificationRuleRepositoryImpl(override val notificationRuleHistoryRepository: NotificationRuleHistoryRepository) extends NotificationRuleRepository {

  import api._

  private val repositoryLogger = LoggerFactory.getLogger(this.getClass)

  private implicit class DBIOActionOps[T](val action: api.DBIO[T]) {
    def withErrorHandling(errorMessage: String)(implicit ec: ExecutionContext): DBIOAction[T, NoStream, Effect.All] = {
      action.asTry.map {
        case Success(value) => value
        case Failure(ex) =>
          repositoryLogger.error(errorMessage, ex)
          throw new ApiException(GenericDatabaseError)
      }
    }
  }

  override def insertNotificationRule(notificationRule: NotificationRule, user: String)(implicit ec: ExecutionContext): Future[Long] = {
    db.run(insertNotificationRuleInternal(notificationRule, user)
      .transactionally
      .withErrorHandling(s"Unexpected error occurred when inserting notificationRule $notificationRule")
    )
  }

  override def getNotificationRule(id: Long)(implicit ec: ExecutionContext): Future[NotificationRule] =
    db.run(getNotificationRuleInternal(id)
      .withErrorHandling(s"Unexpected error occurred when getting notificationRule with id $id")
    )

  override def getNotificationRules()(implicit ec: ExecutionContext): Future[Seq[NotificationRule]] =
    db.run(notificationRuleTable.result
      .withErrorHandling("Unexpected error occurred when getting notificationRules")
    )

  override def updateNotificationRule(notificationRule: NotificationRule, user: String)(implicit ec: ExecutionContext): Future[Unit] =
    db.run(updateNotificationRuleInternal(notificationRule, user)
      .transactionally
      .withErrorHandling(s"Unexpected error occurred when updating notificationRule $notificationRule")
    )

  override def deleteNotificationRule(id: Long, user: String)(implicit ec: ExecutionContext): Future[Unit] =
    db.run(deleteNotificationRuleInternal(id, user)
      .transactionally
      .withErrorHandling(s"Unexpected error occurred when deleting notificationRule with id $id")
    )

  override def searchNotificationRules(searchRequest: TableSearchRequest)(implicit ec: ExecutionContext): Future[TableSearchResponse[NotificationRule]] =
    db.run(notificationRuleTable.search(searchRequest)
      .withErrorHandling(s"Unexpected error occurred when searching notification rules with request ${searchRequest}")
    )

  override def getMatchingNotificationRules(workflowId: Long, status: DagInstanceStatus, currentTime: LocalDateTime)(implicit ec: ExecutionContext): Future[(Seq[NotificationRule], Workflow)] = {
    val lastSucceededDagSubQuery = dagInstanceTable
      .filter(_.status.inSet(Set(DagInstanceStatuses.Succeeded)))
      .filter(_.workflowId === LiteralColumn[Long](workflowId).bind)
      .filter(_.finished.isDefined)
      .sortBy(_.finished.desc)
      .take(1)
      .map(_.finished)
    db.run(
      notificationRuleTable
        .filter(_.isActive)
        .filter(_.statuses.??(LiteralColumn[String](dagInstanceStatus2String(status))))
        .join(workflowTable).on((_, w) => w.id === LiteralColumn[Long](workflowId).bind)
        .filter { case (n, w) => n.workflowPrefix.isEmpty ||
          n.workflowPrefix.length === 0 ||
          w.name.toLowerCase.like(n.workflowPrefix.toLowerCase ++ LiteralColumn[String]("%"))}
        .filter { case (n, w) => n.project.isEmpty ||
          n.project.length === 0 ||
          w.project.toLowerCase === n.project.toLowerCase}
        .joinLeft(lastSucceededDagSubQuery)
        .filter { case ((n, _), lastSuccess) => lastSuccess.isEmpty ||
            n.minElapsedSecondsSinceLastSuccess.isEmpty ||
            (LiteralColumn[LocalDateTime](currentTime) - lastSuccess.flatten).part("epoch") >= n.minElapsedSecondsSinceLastSuccess.asColumnOf[Double]
        }
        .map { case ((n, w), _) => (n, w)}
        .result
        .map(notificationRuleWorkflows => (notificationRuleWorkflows.map(_._1), notificationRuleWorkflows.head._2))
    )
  }

  private def insertNotificationRuleInternal(notificationRule: NotificationRule, user: String)(implicit ec: ExecutionContext) = {
    val notificationRuleToInsert = notificationRule.copy(created = LocalDateTime.now())
    for {
      id <- notificationRuleTable returning notificationRuleTable.map(_.id) += notificationRuleToInsert
      notificationRuleWithId <- getNotificationRuleInternal(id)
      _ <- notificationRuleHistoryRepository.create(notificationRuleWithId, user)
    } yield {
      id
    }
  }

  private def getNotificationRuleInternal(id: Long)(implicit ec: ExecutionContext): DBIO[NotificationRule] = {
    notificationRuleTable.filter(_.id === id).result.map(_.headOption.getOrElse(
      throw new ApiException(ValidationError(s"Notification Rule with id ${id} does not exist.")))
    )
  }

  private def updateNotificationRuleInternal(notificationRule: NotificationRule, user: String)(implicit ec: ExecutionContext) = {
    for {
      _ <- notificationRuleTable.filter(_.id === notificationRule.id)
        .update(notificationRule.copy(updated = Option(LocalDateTime.now())))
      notificationRuleUpdated <- getNotificationRuleInternal(notificationRule.id)
      _ <- notificationRuleHistoryRepository.update(notificationRuleUpdated, user)
    } yield {
      (): Unit
    }
  }

  private def deleteNotificationRuleInternal(id: Long, user: String)(implicit ec: ExecutionContext) = {
    for {
      notificationRuleToDelete <- getNotificationRuleInternal(id)
      _ <- notificationRuleHistoryRepository.delete(notificationRuleToDelete, user)
      _ <- notificationRuleTable.filter(_.id === id).delete
    } yield {
      (): Unit
    }
  }
}
