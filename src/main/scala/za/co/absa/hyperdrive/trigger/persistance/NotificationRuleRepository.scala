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
}

@stereotype.Repository
class NotificationRuleRepositoryImpl(override val notificationRuleHistoryRepository: NotificationRuleHistoryRepository) extends NotificationRuleRepository {

  import api._

  private val repositoryLogger = LoggerFactory.getLogger(this.getClass)

  override def insertNotificationRule(notificationRule: NotificationRule, user: String)(implicit ec: ExecutionContext): Future[Long] = {
    db.run(
      insertNotificationRuleInternal(notificationRule, user)
        .transactionally.asTry.map {
        case Success(id) => id
        case Failure(ex) =>
          repositoryLogger.error(s"Unexpected error occurred when inserting notificationRule $notificationRule", ex)
          throw new ApiException(GenericDatabaseError)
      }
    )
  }

  override def getNotificationRule(id: Long)(implicit ec: ExecutionContext): Future[NotificationRule] = db.run(
    getNotificationRuleInternal(id).asTry.map {
      case Success(value) => value
      case Failure(ex) =>
        repositoryLogger.error(s"Unexpected error occurred when getting notificationRule with id $id", ex)
        throw new ApiException(GenericDatabaseError)
    }
  )

  override def getNotificationRules()(implicit ec: ExecutionContext): Future[Seq[NotificationRule]] = db.run(
    notificationRuleTable.result.asTry.map {
      case Success(value) => value
      case Failure(ex) =>
        repositoryLogger.error(s"Unexpected error occurred when getting notificationRules", ex)
        throw new ApiException(GenericDatabaseError)
    }
  )

  override def updateNotificationRule(notificationRule: NotificationRule, user: String)(implicit ec: ExecutionContext): Future[Unit] = {
    db.run(updateNotificationRuleInternal(notificationRule, user)
      .transactionally.asTry.map {
      case Success(_) => (): Unit
      case Failure(ex) =>
        repositoryLogger.error(s"Unexpected error occurred when updating notificationRule $notificationRule", ex)
        throw new ApiException(GenericDatabaseError)
    }
    )
  }

  override def deleteNotificationRule(id: Long, user: String)(implicit ec: ExecutionContext): Future[Unit] = {
    db.run(deleteNotificationRuleInternal(id, user)
      .transactionally.asTry.map {
      case Success(_) => (): Unit
      case Failure(ex) =>
        repositoryLogger.error(s"Unexpected error occurred when deleting notificationRule with id $id", ex)
        throw new ApiException(GenericDatabaseError)
    }
    )
  }

  override def searchNotificationRules(searchRequest: TableSearchRequest)(implicit ec: ExecutionContext): Future[TableSearchResponse[NotificationRule]] = {
    db.run(notificationRuleTable.search(searchRequest))
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
