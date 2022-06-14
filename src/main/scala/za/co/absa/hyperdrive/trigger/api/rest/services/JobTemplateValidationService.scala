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
import za.co.absa.hyperdrive.trigger.api.rest.utils.ValidationServiceUtil
import za.co.absa.hyperdrive.trigger.models.JobTemplate
import za.co.absa.hyperdrive.trigger.models.errors.{ApiError, ValidationError}
import za.co.absa.hyperdrive.trigger.persistance.JobTemplateRepository

import scala.concurrent.{ExecutionContext, Future}

trait JobTemplateValidationService {
  val jobTemplateRepository: JobTemplateRepository
  def validate(jobTemplate: JobTemplate)(implicit ec: ExecutionContext): Future[Unit]
}

@Service
class JobTemplateValidationServiceImpl(override val jobTemplateRepository: JobTemplateRepository)
    extends JobTemplateValidationService {

  def validate(jobTemplate: JobTemplate)(implicit ec: ExecutionContext): Future[Unit] = {
    val validators = Seq(validateJobTemplateNameIsNotEmpty(jobTemplate.name), validateWorkflowIsUnique(jobTemplate))
    ValidationServiceUtil.reduce(validators)
  }

  private def validateJobTemplateNameIsNotEmpty(jobTemplateName: String): Future[Seq[ApiError]] = {
    val errors = jobTemplateName match {
      case name if name.isEmpty => Seq(ValidationError("Job template name must not be empty"))
      case _                    => Seq.empty
    }
    Future.successful(errors)
  }

  private def validateWorkflowIsUnique(jobTemplate: JobTemplate)(implicit ec: ExecutionContext): Future[Seq[ApiError]] =
    jobTemplateRepository
      .existsOtherJobTemplate(jobTemplate.name, jobTemplate.id)
      .map(exists =>
        if (exists) {
          Seq(ValidationError("Job template name already exists"))
        } else {
          Seq.empty
        }
      )
}
