
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

import javax.inject.Inject
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.models.WorkflowJoined
import za.co.absa.hyperdrive.trigger.models.errors.{ApiError, ValidationError}
import za.co.absa.hyperdrive.trigger.persistance.WorkflowRepository

import scala.concurrent.{ExecutionContext, Future}

trait WorkflowValidationService {
  val workflowRepository: WorkflowRepository

  def validateOnInsert(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Seq[ApiError]]

  def validateOnUpdate(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Seq[ApiError]]
}

@Service
class WorkflowValidationServiceImpl @Inject()(override val workflowRepository: WorkflowRepository)
  extends WorkflowValidationService {
  override def validateOnInsert(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Seq[ApiError]] = {
    val validators = Seq(
      validateWorkflowNotExists(workflow),
      validateProjectIsNotEmpty(workflow)
    )
    combine(validators)
  }

  override def validateOnUpdate(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Seq[ApiError]] = {
    val validators = Seq(
      validateWorkflowIsUnique(workflow),
      validateProjectIsNotEmpty(workflow),
      validateWorkflowData(workflow)
    )
    combine(validators)
  }

  private def combine(validators: Seq[Future[Seq[ApiError]]])(implicit ec: ExecutionContext) = {
    val combinedValidators = Future.fold(validators)(Seq.empty[ApiError])(_ ++ _)
    combinedValidators
  }

  private def validateWorkflowNotExists(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Seq[ApiError]] = {
    workflowRepository.existsWorkflow(workflow.name)
      .map(exists => if (exists) {
        Seq(ValidationError("Workflow name already exists"))
      } else {
        Seq()
      })
  }

  private def validateWorkflowIsUnique(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Seq[ApiError]] = {
    workflowRepository.existsOtherWorkflow(workflow.name, workflow.id)
      .map(exists => if (exists) {
        Seq(ValidationError("Workflow name already exists"))
      } else {
        Seq()
      })
  }

  private def validateProjectIsNotEmpty(workflow: WorkflowJoined): Future[Seq[ApiError]] = {
    val projectValidation = Option(workflow.project) match {
      case Some(v) if v.isEmpty => Some(ValidationError("Project must not be empty"))
      case Some(_) => None
      case None => Some(ValidationError("Project must be set"))
    }
    Future.successful(projectValidation.toSeq)
  }

  private def validateWorkflowData(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Seq[ApiError]] = {
    workflowRepository.getWorkflow(workflow.id)
      .map(persistedWorkflowData => if (persistedWorkflowData == workflow) {
        Seq(ValidationError("nothing to update"))
      } else {
        Seq()
      })
  }
}

