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
import za.co.absa.hyperdrive.trigger.models.NotificationRule

import java.time.LocalDateTime

trait NotificationRuleTable {
  this: Profile with JdbcTypeMapper =>
  import api._

  final class NotificationRuleTable(tag: Tag) extends Table[NotificationRule](tag, _tableName = "notification_rule") {
    def project: Rep[Option[String]] = column[Option[String]]("project")
    def workflowPrefix: Rep[Option[String]] = column[Option[String]]("workflow_prefix")
    def minElapsedSecondsSinceLastSuccess: Rep[Option[Long]] = column[Option[Long]]("min_elapsed_secs_last_success")
    def recipients: Rep[Recipients] = column[Recipients]("recipients")
    def created: Rep[LocalDateTime] = column[LocalDateTime]("created")
    def updated: Rep[Option[LocalDateTime]] = column[Option[LocalDateTime]]("updated")
    def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))

    def * : ProvenShape[NotificationRule] = (project, workflowPrefix, minElapsedSecondsSinceLastSuccess, recipients,
      created, updated, id) <> (
      notificationTuple =>
        NotificationRule.apply(
          project = notificationTuple._1,
          workflowPrefix = notificationTuple._2,
          minElapsedSecondsSinceLastSuccess = notificationTuple._3,
          recipients = notificationTuple._4,
          created = notificationTuple._5,
          updated = notificationTuple._6,
          id = notificationTuple._7
        ),
      NotificationRule.unapply
    )
  }

  lazy val notificationRuleTable = TableQuery[NotificationRuleTable]
}
