
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

import org.apache.commons.validator.routines.EmailValidator
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.api.rest.utils.ValidationServiceUtil
import za.co.absa.hyperdrive.trigger.models.NotificationRule
import za.co.absa.hyperdrive.trigger.models.errors.ValidationError
import za.co.absa.hyperdrive.trigger.persistance.WorkflowRepository

import scala.concurrent.{ExecutionContext, Future}

trait NotificationRuleValidationService {
  val workflowRepository: WorkflowRepository
  def validate(notificationRule: NotificationRule)(implicit ec: ExecutionContext): Future[Unit]
}

@Service
class NotificationRuleValidationServiceImpl (override val workflowRepository: WorkflowRepository) extends NotificationRuleValidationService {
  private val emailValidator = EmailValidator.getInstance()

  def validate(notificationRule: NotificationRule)(implicit ec: ExecutionContext): Future[Unit] = {
    val validators = Seq(
      notificationRule.project
        .flatMap(emptyStringToNone)
        .map(validateProjectExists)
        .getOrElse(Future{Seq()}),
      notificationRule.workflowPrefix
        .flatMap(emptyStringToNone)
        .map(validateWorkflowsWithPrefixExists)
        .getOrElse(Future{Seq()}),
      validateEmailAddresses(notificationRule.recipients),
      validateMinElapsedSeconds(notificationRule.minElapsedSecondsSinceLastSuccess)
    )
    ValidationServiceUtil.reduce(validators)
  }

  private def emptyStringToNone(str: String): Option[String] = {
    if(str.isEmpty) {
      None
    } else {
      Some(str)
    }
  }

  private def validateProjectExists(project: String)(implicit ec: ExecutionContext): Future[Seq[ValidationError]] = {
    workflowRepository.existsProject(project)
      .map(exists => if (exists) {
        Seq()
      } else {
        Seq(ValidationError(s"No project with name $project exists"))
      })
  }

  private def validateWorkflowsWithPrefixExists(workflowPrefix: String)(implicit ec: ExecutionContext): Future[Seq[ValidationError]] = {
    workflowRepository.existsWorkflowWithPrefix(workflowPrefix)
      .map(exists => if (exists) {
        Seq()
      } else {
        Seq(ValidationError(s"No workflow with prefix $workflowPrefix exists"))
      })
  }

  private def validateEmailAddresses(emailAddresses: Seq[String]): Future[Seq[ValidationError]] = {
    Future.successful(
      emailAddresses.filterNot(address => emailValidator.isValid(address))
        .map(address => ValidationError(s"Recipient $address is not a valid e-mail address"))
    )
  }

  private def validateMinElapsedSeconds(minElapsedSeconds: Option[Long]): Future[Seq[ValidationError]] = {
    Future.successful(
      minElapsedSeconds
        .filter(_ < 0)
        .map(v => Seq(ValidationError(s"Min elapsed seconds since last success cannot be negative, is $v")))
        .getOrElse(Seq())
    )
  }
}
