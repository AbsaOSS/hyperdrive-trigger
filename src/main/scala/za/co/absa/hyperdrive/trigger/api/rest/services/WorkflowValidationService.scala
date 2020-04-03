
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

  def validateOnInsert(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Option[Set[ApiError]]]

  def validateOnUpdate(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Option[Set[ApiError]]]
}

@Service
class WorkflowValidationServiceImpl @Inject()(override val workflowRepository: WorkflowRepository)
  extends WorkflowValidationService {
  override def validateOnInsert(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Option[Set[ApiError]]] = {
    val validators = Set(
      validateWorkflowNotExists(workflow),
      validateProjectIsNotEmpty(workflow)
    )
    combine(validators)
  }

  override def validateOnUpdate(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Option[Set[ApiError]]] = {
    val validators = Set(
      validateWorkflowIsUnique(workflow),
      validateProjectIsNotEmpty(workflow)
    )
    combine(validators)
  }

  private def combine(validators: Set[Future[Set[ApiError]]])(implicit ec: ExecutionContext) = {
    val combinedValidators = Future.fold(validators)(Set.empty[ApiError])(_ ++ _)
    combinedValidators.map(errors => if (errors.isEmpty) None else Some(errors))
  }

  private def validateWorkflowNotExists(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Set[ApiError]] = {
    workflowRepository.existsWorkflow(workflow.name)
      .map(exists => if (exists) {
        Set(ValidationError("Workflow name already exists"))
      } else {
        Set()
      })
  }

  private def validateWorkflowIsUnique(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Set[ApiError]] = {
    workflowRepository.existsOtherWorkflow(workflow.name, workflow.id)
      .map(exists => if (exists) {
        Set(ValidationError("Workflow name already exists"))
      } else {
        Set()
      })
  }

  private def validateProjectIsNotEmpty(workflow: WorkflowJoined): Future[Set[ApiError]] = {
    val projectValidation = Option(workflow.project) match {
      case Some(v) if v.isEmpty => Some(ValidationError("Project must not be empty"))
      case Some(_) => None
      case None => Some(ValidationError("Project must be set"))
    }
    Future.successful(projectValidation.toSet)
  }
}
