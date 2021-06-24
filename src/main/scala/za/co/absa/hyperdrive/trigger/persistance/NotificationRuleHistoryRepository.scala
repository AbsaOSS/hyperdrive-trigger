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

import org.springframework.stereotype
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.enums.DBOperation.{Create, DBOperation, Delete, Update}

import java.time.LocalDateTime
import scala.concurrent.{ExecutionContext, Future}

trait NotificationRuleHistoryRepository extends Repository {
  import slick.dbio.DBIO

  private[persistance] def create(notificationRule: NotificationRule, user: String)(implicit ec: ExecutionContext): DBIO[Long]
  private[persistance] def update(notificationRule: NotificationRule, user: String)(implicit ec: ExecutionContext): DBIO[Long]
  private[persistance] def delete(notificationRule: NotificationRule, user: String)(implicit ec: ExecutionContext): DBIO[Long]

  def getHistoryForNotificationRule(notificationRuleId: Long)(implicit ec: ExecutionContext): Future[Seq[History]]
  def getNotificationRulesFromHistory(leftNotificationRuleHistoryId: Long, rightNotificationRuleHistoryId: Long)(implicit ec: ExecutionContext): Future[HistoryPair[NotificationRuleHistory]]
}

@stereotype.Repository
class NotificationRuleHistoryRepositoryImpl extends NotificationRuleHistoryRepository {
  import api._

  private def insert(notificationRule: NotificationRule, user: String, operation: DBOperation)(implicit ec: ExecutionContext): DBIO[Long] = {
    val notificationRuleHistory = NotificationRuleHistory(
      history = History(
        changedOn = LocalDateTime.now(),
        changedBy = user,
        operation = operation
      ),
      notificationRuleId = notificationRule.id,
      notificationRule = notificationRule
    )
    notificationRuleHistoryTable returning notificationRuleHistoryTable.map(_.id) += notificationRuleHistory
  }

  override private[persistance] def create(notificationRule: NotificationRule, user: String)(implicit ec: ExecutionContext): DBIO[Long] = {
    this.insert(notificationRule, user, Create)
  }

  override private[persistance] def update(notificationRule: NotificationRule, user: String)(implicit ec: ExecutionContext): DBIO[Long] = {
    this.insert(notificationRule, user, Update)
  }

  override private[persistance] def delete(notificationRule: NotificationRule, user: String)(implicit ec: ExecutionContext): DBIO[Long] = {
    this.insert(notificationRule, user, Delete)
  }

  override def getHistoryForNotificationRule(notificationRuleId: Long)(implicit ec: ExecutionContext): Future[Seq[History]] = {
    db.run(notificationRuleHistoryTable.getHistoryForEntity(notificationRuleId))
  }

  override def getNotificationRulesFromHistory(leftNotificationRuleHistoryId: Long, rightNotificationRuleHistoryId: Long)
  (implicit ec: ExecutionContext): Future[HistoryPair[NotificationRuleHistory]] = {
    db.run(notificationRuleHistoryTable.getEntitiesFromHistory(
      leftNotificationRuleHistoryId, rightNotificationRuleHistoryId
    ))
  }
}
