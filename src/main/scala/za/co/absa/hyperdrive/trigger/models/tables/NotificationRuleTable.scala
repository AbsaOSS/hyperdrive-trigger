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

import play.api.libs.json.{JsValue, Json}
import slick.lifted.ProvenShape
import za.co.absa.hyperdrive.trigger.models.NotificationRule
import za.co.absa.hyperdrive.trigger.models.NotificationRule.Recipients
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses.DagInstanceStatus

import java.time.LocalDateTime

trait NotificationRuleTable extends SearchableTableQuery {
  this: Profile with JdbcTypeMapper =>
  import api._

  final class NotificationRuleTable(tag: Tag) extends Table[NotificationRule](tag, _tableName = "notification_rule") with SearchableTable {
    def isActive: Rep[Boolean] = column[Boolean]("is_active")
    def project: Rep[Option[String]] = column[Option[String]]("project")
    def workflowPrefix: Rep[Option[String]] = column[Option[String]]("workflow_prefix")
    def minElapsedSecondsSinceLastSuccess: Rep[Option[Long]] = column[Option[Long]]("min_elapsed_secs_last_success")
    def statuses: Rep[JsValue] = column[JsValue]("statuses", O.SqlType("JSONB"))
    def recipients: Rep[Recipients] = column[Recipients]("recipients", O.SqlType("JSONB"))
    def created: Rep[LocalDateTime] = column[LocalDateTime]("created")
    def updated: Rep[Option[LocalDateTime]] = column[Option[LocalDateTime]]("updated")
    def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))

    def * : ProvenShape[NotificationRule] = (isActive, project, workflowPrefix, minElapsedSecondsSinceLastSuccess,
      statuses, recipients, created, updated, id) <> (
      notificationTuple =>
        NotificationRule.apply(
          isActive = notificationTuple._1,
          project = notificationTuple._2,
          workflowPrefix = notificationTuple._3,
          minElapsedSecondsSinceLastSuccess = notificationTuple._4,
          statuses = jsValue2DagInstanceStatus(notificationTuple._5),
          recipients = notificationTuple._6,
          created = notificationTuple._7,
          updated = notificationTuple._8,
          id = notificationTuple._9
        ),
      unapplyNotificationRule
    )

    override def fieldMapping: Map[String, Rep[_]] = Map(
      "isActive" -> this.isActive,
      "project" -> this.project,
      "workflowPrefix" -> this.workflowPrefix,
      "minElapsedSecondsSinceLastSuccess" -> this.minElapsedSecondsSinceLastSuccess,
      "created" -> this.created,
      "updated" -> this.updated,
      "id" -> this.id
    )

    override def defaultSortColumn: Rep[_] = id

    private def dagInstanceStatus2JsValue(status: Seq[DagInstanceStatus]): JsValue = Json.toJson(status)

    private def jsValue2DagInstanceStatus(jsValue: JsValue): Seq[DagInstanceStatus] = jsValue.as[Seq[DagInstanceStatus]]

    private def unapplyNotificationRule(n: NotificationRule) =
      NotificationRule.unapply(n).map(tuple => tuple.copy(_5 = dagInstanceStatus2JsValue(tuple._5)))
  }

  lazy val notificationRuleTable = TableQuery[NotificationRuleTable]
}
