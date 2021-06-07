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

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.models.{NotificationRule, Workflow}
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses.DagInstanceStatus
import za.co.absa.hyperdrive.trigger.models.search.{TableSearchRequest, TableSearchResponse}
import za.co.absa.hyperdrive.trigger.persistance.NotificationRuleRepository

import java.time.LocalDateTime
import scala.concurrent.{ExecutionContext, Future}

trait NotificationRuleService {
  val notificationRuleRepository: NotificationRuleRepository

  def createNotificationRule(notificationRule: NotificationRule)(implicit ec: ExecutionContext): Future[NotificationRule]

  def getNotificationRule(id: Long)(implicit ec: ExecutionContext): Future[NotificationRule]

  def getNotificationRules()(implicit ec: ExecutionContext): Future[Seq[NotificationRule]]

  def updateNotificationRule(notificationRule: NotificationRule)(implicit ec: ExecutionContext): Future[NotificationRule]

  def deleteNotificationRule(id: Long)(implicit ec: ExecutionContext): Future[Boolean]

  def searchNotificationRules(tableSearchRequest: TableSearchRequest)(implicit ec: ExecutionContext): Future[TableSearchResponse[NotificationRule]]

  def getMatchingNotificationRules(workflowId: Long, status: DagInstanceStatus)(implicit ec: ExecutionContext): Future[(Seq[NotificationRule], Workflow)]

}

@Service
class NotificationRuleServiceImpl(override val notificationRuleRepository: NotificationRuleRepository) extends NotificationRuleService {

  private[services] def getUserName: () => String = {
    SecurityContextHolder.getContext.getAuthentication.getPrincipal.asInstanceOf[UserDetails].getUsername.toLowerCase
  }

  override def createNotificationRule(notificationRule: NotificationRule)(implicit ec: ExecutionContext): Future[NotificationRule] = {
    val userName = getUserName.apply()
    notificationRuleRepository.insertNotificationRule(notificationRule, userName).map(id => notificationRule.copy(id = id))
  }

  override def getNotificationRule(id: Long)(implicit ec: ExecutionContext): Future[NotificationRule] = {
    notificationRuleRepository.getNotificationRule(id)
  }

  override def getNotificationRules()(implicit ec: ExecutionContext): Future[Seq[NotificationRule]] = {
    notificationRuleRepository.getNotificationRules()
  }

  override def updateNotificationRule(notificationRule: NotificationRule)(implicit ec: ExecutionContext): Future[NotificationRule] = {
    val userName = getUserName.apply()
    notificationRuleRepository.updateNotificationRule(notificationRule, userName).map(_ => notificationRule)
  }

  override def deleteNotificationRule(id: Long)(implicit ec: ExecutionContext): Future[Boolean] = {
    val userName = getUserName.apply()
    notificationRuleRepository.deleteNotificationRule(id, userName).map(_ => true)
  }

  override def searchNotificationRules(tableSearchRequest: TableSearchRequest)(implicit ec: ExecutionContext): Future[TableSearchResponse[NotificationRule]] = {
    notificationRuleRepository.searchNotificationRules(tableSearchRequest)
  }

  override def getMatchingNotificationRules(workflowId: Long, status: DagInstanceStatus)(implicit ec: ExecutionContext): Future[(Seq[NotificationRule], Workflow)] = {
    notificationRuleRepository.getMatchingNotificationRules(workflowId, status, LocalDateTime.now())
  }
}
