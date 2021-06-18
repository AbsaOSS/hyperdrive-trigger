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
import za.co.absa.hyperdrive.trigger.models.{History, HistoryPair, NotificationRuleHistory}
import za.co.absa.hyperdrive.trigger.persistance.NotificationRuleHistoryRepository

import scala.concurrent.{ExecutionContext, Future}

trait NotificationRuleHistoryService {
  val historyRepository: NotificationRuleHistoryRepository

  def getHistoryForNotificationRule(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[History]]
  def getNotificationRulesFromHistory(leftHistoryId: Long, rightHistoryId: Long)(implicit ec: ExecutionContext): Future[HistoryPair[NotificationRuleHistory]]
}

@Service
class NotificationRuleHistoryServiceImpl(override val historyRepository: NotificationRuleHistoryRepository) extends NotificationRuleHistoryService {

  override def getHistoryForNotificationRule(notificationRuleId: Long)(implicit ec: ExecutionContext): Future[Seq[History]] = {
    historyRepository.getHistoryForNotificationRule(notificationRuleId)
  }

  override def getNotificationRulesFromHistory(leftHistoryId: Long, rightHistoryId: Long)(implicit ec: ExecutionContext): Future[HistoryPair[NotificationRuleHistory]] = {
    historyRepository.getNotificationRulesFromHistory(leftHistoryId, rightHistoryId)
  }
}
