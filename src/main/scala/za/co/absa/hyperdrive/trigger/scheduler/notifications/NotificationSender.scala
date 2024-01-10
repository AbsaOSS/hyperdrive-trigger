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

import com.typesafe.scalalogging.LazyLogging
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.api.rest.services.NotificationRuleService
import za.co.absa.hyperdrive.trigger.configuration.application.{GeneralConfig, NotificationConfig, SparkConfig}
import za.co.absa.hyperdrive.trigger.models.{DagInstance, JobInstance, NotificationRule, Workflow}
import za.co.absa.hyperdrive.trigger.scheduler.utilities.email.EmailService

import java.time.format.DateTimeFormatter
import java.util.concurrent.ConcurrentLinkedQueue
import scala.collection.mutable
import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

trait NotificationSender {
  def createNotifications(dagInstance: DagInstance, jobInstances: Seq[JobInstance])(
    implicit ec: ExecutionContext
  ): Future[Unit]
  def sendNotifications(): Unit
}

@Component
class NotificationSenderImpl(
  notificationRuleService: NotificationRuleService,
  emailService: EmailService,
  sparkConfig: SparkConfig,
  notificationConfig: NotificationConfig,
  generalConfig: GeneralConfig
) extends NotificationSender
    with LazyLogging {
  private case class Message(recipients: Seq[String], subject: String, text: String, attempts: Int)

  private val sender = notificationConfig.senderAddress
  private val notificationEnabled = notificationConfig.enabled
  private val environment = generalConfig.environment
  private val yarnBaseUrl = sparkConfig.hadoopResourceManagerUrlBase
  private val dateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME
  private val messageQueue = new ConcurrentLinkedQueue[Message]
  private val causedByPattern = """Caused by: (.*)\n""".r

  def createNotifications(dagInstance: DagInstance, jobInstances: Seq[JobInstance])(
    implicit ec: ExecutionContext
  ): Future[Unit] =
    if (notificationEnabled) {
      notificationRuleService.getMatchingNotificationRules(dagInstance.workflowId, dagInstance.status).map {
        case Some((rules, workflow)) =>
          rules
            .map(rule => createMessage(rule, workflow, dagInstance, jobInstances))
            .foreach { message =>
              logger.debug(s"Adding to queue message ${message.subject} from $sender to ${message.recipients}")
              messageQueue.add(message)
            }
        case None =>
          logger
            .debug(s"No rules matching workflow ID ${dagInstance.workflowId} with status ${dagInstance.status} found")
          Future.successful((): Unit)
      }
    } else {
      logger.debug(s"Attempting to send notifications for $dagInstance, but it is disabled")
      Future {}
    }

  def sendNotifications(): Unit = {
    var messageOpt: Option[Message] = None
    while ({
      messageOpt = Option(messageQueue.poll())
      messageOpt.isDefined
    }) {
      val message = messageOpt.get
      Thread.sleep(notificationConfig.delay.toMillis)
      try {
        logger.debug(s"Sending message ${message.subject} from $sender to ${message.recipients}")
        emailService.sendMessageToBccRecipients(sender, message.recipients, message.subject, message.text)
      } catch {
        case NonFatal(e) if message.attempts >= notificationConfig.maxRetries =>
          logger.error(s"Failed to send message ${message.subject} from $sender to ${message.recipients}", e)
        case NonFatal(_) =>
          logger.warn(
            s"Could not send message ${message.subject} from $sender to ${message.recipients}. Adding back to queue"
          )
          messageQueue.add(message.copy(attempts = message.attempts + 1))
      }
    }
  }

  private def createMessage(
    notificationRule: NotificationRule,
    workflow: Workflow,
    dagInstance: DagInstance,
    jobInstances: Seq[JobInstance]
  ) = {
    val subject = s"Hyperdrive Notifications, $environment: Workflow ${workflow.name} ${dagInstance.status.name}"
    val footer = "This message has been generated automatically. Please don't reply to it.\n\nHyperdriveDevTeam"
    val messageMap = mutable.LinkedHashMap(
      "Environment" -> environment,
      "Project" -> workflow.project,
      "Workflow Name" -> workflow.name,
      "Started" -> dagInstance.started.format(dateTimeFormatter),
      "Finished" -> dagInstance.finished.map(_.format(dateTimeFormatter)).getOrElse("Couldn't get finish time"),
      "Status" -> dagInstance.status.name
    )
    val failedJob = jobInstances
      .sortBy(_.order)(Ordering.Int.reverse)
      .find(_.jobStatus.isFailed)
    failedJob.map(_.applicationId.map { appId =>
        val applicationUrl = s"${yarnBaseUrl.stripSuffix("/")}/cluster/app/$appId"
        messageMap += ("Failed application" -> applicationUrl)
      })

    messageMap += ("Notification rule ID" -> notificationRule.id.toString)

    val diagnosticsOpt = failedJob.flatMap(_.diagnostics)
    val causes = diagnosticsOpt.map { diagnostics =>
      causedByPattern.findAllMatchIn(diagnostics).map(_.group(1)).toSeq.reduce(_ + "\n" + _)
    }
      .map("Causes:\n" + _ + "\n\n")
      .getOrElse("")

    val stackTrace = diagnosticsOpt.map { diagnostics =>
      s"Stack trace:\n$diagnostics\n\n"
    }.getOrElse("")

    val message = messageMap.map { case (key, value) => s"$key: $value" }.reduce(_ + "\n" + _) +
      "\n\n" +
      causes +
      stackTrace +
      footer
    Message(notificationRule.recipients, subject, message, 1)
  }
}
