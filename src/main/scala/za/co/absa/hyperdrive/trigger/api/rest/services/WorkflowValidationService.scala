
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

import scala.collection.immutable.SortedMap
import scala.concurrent.{ExecutionContext, Future}

trait WorkflowValidationService {
  val workflowRepository: WorkflowRepository

  def validateOnInsert(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Seq[ApiError]]

  def validateOnUpdate(originalWorkflow: WorkflowJoined, updatedWorkflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Seq[ApiError]]
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

  override def validateOnUpdate(originalWorkflow: WorkflowJoined, updatedWorkflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Seq[ApiError]] = {
    val validators = Seq(
      validateWorkflowIsUnique(updatedWorkflow),
      validateProjectIsNotEmpty(updatedWorkflow),
      validateWorkflowData(originalWorkflow, updatedWorkflow)
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

  private[services] def validateWorkflowData(originalWorkflow: WorkflowJoined, updatedWorkflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Seq[ApiError]] = {
    val workflowDetailsVerification = Seq(
      originalWorkflow.name == updatedWorkflow.name,
      originalWorkflow.isActive == updatedWorkflow.isActive,
      originalWorkflow.project == updatedWorkflow.project
    )

    val workflowSensorVerification = Seq(
      originalWorkflow.sensor.sensorType == updatedWorkflow.sensor.sensorType,
      originalWorkflow.sensor.properties.matchProperties.equals(updatedWorkflow.sensor.properties.matchProperties),
      originalWorkflow.sensor.properties.settings.variables.equals(updatedWorkflow.sensor.properties.settings.variables),
      areMapsEqual(originalWorkflow.sensor.properties.settings.maps, updatedWorkflow.sensor.properties.settings.maps)
    )

    val workflowJobsVerification = Seq(
      Seq(originalWorkflow.dagDefinitionJoined.jobDefinitions.length == updatedWorkflow.dagDefinitionJoined.jobDefinitions.length),
      Seq(originalWorkflow.dagDefinitionJoined.jobDefinitions.map(_.order).equals(updatedWorkflow.dagDefinitionJoined.jobDefinitions.map(_.order))),
      originalWorkflow.dagDefinitionJoined.jobDefinitions.flatMap(originalJob => {
        val updatedJobOption = updatedWorkflow.dagDefinitionJoined.jobDefinitions.find(_.order == originalJob.order)
        updatedJobOption.map(updatedJob =>
          Seq(
            originalJob.name == updatedJob.name,
            originalJob.jobTemplateId == updatedJob.jobTemplateId,
            originalJob.order == updatedJob.order,
            originalJob.jobParameters.variables.equals(updatedJob.jobParameters.variables),
            areMapsEqual(originalJob.jobParameters.maps, updatedJob.jobParameters.maps),
            areMapsOfMapsEqual(originalJob.jobParameters.keyValuePairs, updatedJob.jobParameters.keyValuePairs)
          )
        ).getOrElse(Seq(false))
      })
    ).flatten

    if((workflowDetailsVerification ++ workflowSensorVerification ++ workflowJobsVerification).contains(false)) {
      Future.successful(Seq())
    } else {
      Future.successful(Seq(ValidationError("Nothing to update")))
    }
  }

  private[services] def areMapsEqual(leftMap: Map[String, List[String]], rightMap: Map[String, List[String]]): Boolean = {
    leftMap.keys.equals(rightMap.keys) && !leftMap.map {
      case (keyLeft: String, valueLeft: List[String]) =>
        rightMap.find(_._1 == keyLeft).exists {
          case (_: String, valueRight: List[String]) => valueLeft.equals(valueRight)
        }
    }.toSeq.contains(false)
  }

  private[services] def areMapsOfMapsEqual(leftMap: Map[String, SortedMap[String, String]], rightMap: Map[String, SortedMap[String, String]]): Boolean = {
    leftMap.keys.equals(rightMap.keys) && !leftMap.map {
      case (keyLeft: String, valueLeft: SortedMap[String, String]) =>
        rightMap.find(_._1 == keyLeft).exists {
          case (_: String, valueRight: SortedMap[String, String]) => valueLeft.equals(valueRight)
        }
    }.toSeq.contains(false)
  }
}
