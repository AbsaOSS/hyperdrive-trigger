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

package za.co.absa.hyperdrive.trigger.scheduler.notifications

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.api.rest.services.{DagInstanceService, NotificationRuleService}
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses.DagInstanceStatus
import za.co.absa.hyperdrive.trigger.models.{Event, Properties}
import za.co.absa.hyperdrive.trigger.persistance._

import scala.concurrent.{ExecutionContext, Future}

@Component
class EmailNotificationSender(notificationRuleService: NotificationRuleService) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  def sendNotifications(workflowId: Long, status: DagInstanceStatus)(implicit ec: ExecutionContext): Future[Unit] = {
    Future{}
  }
}
