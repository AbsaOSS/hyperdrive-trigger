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
import org.springframework.mail.MailException
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.api.rest.services.NotificationRuleService
import za.co.absa.hyperdrive.trigger.models.{DagInstance, JobInstance, NotificationRule, Workflow}
import za.co.absa.hyperdrive.trigger.scheduler.utilities.email.EmailService
import za.co.absa.hyperdrive.trigger.scheduler.utilities.{GeneralConfig, NotificationConfig, SparkExecutorConfig}

import java.time.format.DateTimeFormatter
import scala.collection.mutable
import scala.concurrent.{ExecutionContext, Future}

trait NotificationSender {
  def sendNotifications(dagInstance: DagInstance, jobInstances: Seq[JobInstance])(implicit ec: ExecutionContext): Future[Unit]
}

@Component
class NotificationSenderImpl(notificationRuleService: NotificationRuleService, emailService: EmailService) extends NotificationSender {
  private val logger = LoggerFactory.getLogger(this.getClass)
  private val sender = NotificationConfig.notificationSenderAddress
  private val notificationEnabled = NotificationConfig.notificationEnabled
  private val environment = GeneralConfig.environment
  private val yarnBaseUrl = SparkExecutorConfig.getHadoopResourceManagerUrlBase
  private val dateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME

  def sendNotifications(dagInstance: DagInstance, jobInstances: Seq[JobInstance])(implicit ec: ExecutionContext): Future[Unit] = {
    if (notificationEnabled) {
      notificationRuleService.getMatchingNotificationRules(dagInstance.workflowId, dagInstance.status).map {
        case (rules, workflow) => rules.foreach(rule => createMessageAndSend(rule, workflow, dagInstance, jobInstances))
      }
    } else {
      logger.debug(s"Attempting to send notifications for ${dagInstance}, but it is disabled")
      Future{}
    }
  }

  private def createMessageAndSend(notificationRule: NotificationRule, workflow: Workflow, dagInstance: DagInstance,
                                   jobInstances: Seq[JobInstance]): Unit = {
    val subject = s"Hyperdrive Notifications, ${environment}: Workflow ${workflow.name} ${dagInstance.status.name}"
    val footer = "This message has been generated automatically. Please don't reply to it.\n\nHyperdriveDevTeam"
    val messageMap = mutable.LinkedHashMap(
      "Environment" -> environment,
      "Project" -> workflow.project,
      "Workflow Name" -> workflow.name,
      "Started" -> dagInstance.started.format(dateTimeFormatter),
      "Finished" -> dagInstance.finished.map(_.format(dateTimeFormatter)).getOrElse("Couldn't get finish time"),
      "Status" -> dagInstance.status.name
    )
    jobInstances.sortBy(_.order)(Ordering.Int.reverse).find(_.jobStatus.isFailed).map(_.applicationId.map(
      appId => {
          val applicationUrl = s"${yarnBaseUrl.stripSuffix("/")}/cluster/app/${appId}"
          messageMap += ("Failed application" -> applicationUrl)
        }
      )
    )
    messageMap += ("Notification rule ID" -> notificationRule.id.toString)
    val message = messageMap.map { case (key, value) => s"$key: $value"}.reduce(_ + "\n" + _) + "\n\n" + footer

    logger.debug(s"Sending message ${subject} from ${sender} to ${notificationRule.recipients}")
    try {
      emailService.sendMessageToBccRecipients(sender, notificationRule.recipients, subject, message)
    } catch {
      case e: MailException => logger.error(s"Failed to send message ${subject} from ${sender} to ${notificationRule.recipients}", e)
    }
  }
}
