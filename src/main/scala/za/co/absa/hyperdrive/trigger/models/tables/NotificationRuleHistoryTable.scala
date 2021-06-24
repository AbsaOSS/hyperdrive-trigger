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

package za.co.absa.hyperdrive.trigger.models.tables

import slick.lifted.ProvenShape
import za.co.absa.hyperdrive.trigger.models.enums.DBOperation.DBOperation
import za.co.absa.hyperdrive.trigger.models.{History, NotificationRule, NotificationRuleHistory}

import java.time.LocalDateTime

trait NotificationRuleHistoryTable extends HistoryTableQuery {
  this: Profile with JdbcTypeMapper =>

  import api._

  final class NotificationRuleHistoryTable(tag: Tag) extends Table[NotificationRuleHistory](tag, _tableName = "notification_rule_history") with HistoryTable {
    override def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))
    override def changedOn: Rep[LocalDateTime] = column[LocalDateTime]("changed_on")
    override def changedBy: Rep[String] = column[String]("changed_by")
    override def operation: Rep[DBOperation] = column[DBOperation]("operation")
    override def entityId: Rep[Long] = column[Long]("notification_rule_id")
    def notificationRule: Rep[NotificationRule] = column[NotificationRule]("notification_rule", O.SqlType("JSONB"))

    def * : ProvenShape[NotificationRuleHistory] = (id, changedOn, changedBy, operation, entityId, notificationRule) <> (
      notificationRuleTuple =>
        NotificationRuleHistory.apply(
          history = History.apply(
            id = notificationRuleTuple._1,
            changedOn = notificationRuleTuple._2,
            changedBy = notificationRuleTuple._3,
            operation = notificationRuleTuple._4
          ),
          notificationRuleId = notificationRuleTuple._5,
          notificationRule = notificationRuleTuple._6
        ),
      (notificationRuleHistory: NotificationRuleHistory) => Option(
        (
          notificationRuleHistory.history.id,
          notificationRuleHistory.history.changedOn,
          notificationRuleHistory.history.changedBy,
          notificationRuleHistory.history.operation,
          notificationRuleHistory.notificationRuleId,
          notificationRuleHistory.notificationRule
        )
      )
    )
  }

  lazy val notificationRuleHistoryTable = TableQuery[NotificationRuleHistoryTable]

}
