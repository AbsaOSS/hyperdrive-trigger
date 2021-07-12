
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
import za.co.absa.hyperdrive.trigger.api.rest.utils.ValidationServiceUtil
import za.co.absa.hyperdrive.trigger.models.{AbsaKafkaSensorProperties, HyperdriveDefinitionParameters, JobDefinitionParameters, KafkaSensorProperties, RecurringSensorProperties, SensorProperties, ShellDefinitionParameters, SparkDefinitionParameters, TimeSensorProperties, WorkflowJoined}
import za.co.absa.hyperdrive.trigger.models.errors.{ApiError, ApiException, BulkOperationError, ValidationError}
import za.co.absa.hyperdrive.trigger.persistance.WorkflowRepository

import scala.collection.immutable.SortedMap
import scala.concurrent.{ExecutionContext, Future}

trait WorkflowValidationService {
  val workflowRepository: WorkflowRepository

  def validateOnInsert(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Unit]
  def validateOnInsert(workflows: Seq[WorkflowJoined])(implicit ec: ExecutionContext): Future[Unit]

  def validateOnUpdate(originalWorkflow: WorkflowJoined, updatedWorkflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Unit]
}

@Service
class WorkflowValidationServiceImpl @Inject()(override val workflowRepository: WorkflowRepository)
  extends WorkflowValidationService {
  override def validateOnInsert(workflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Unit] = {
    validateOnInsert(Seq(workflow)).transform(identity, {
      case ex: ApiException => new ApiException(ex.apiErrors.map(_.unwrapError()))
    })
  }

  override def validateOnInsert(workflows: Seq[WorkflowJoined])(implicit ec: ExecutionContext): Future[Unit] = {
    val validators = Seq(
      validateWorkflowNotExists(workflows),
      validateProjectIsNotEmpty(workflows)
    )
    ValidationServiceUtil.reduce(validators)
  }

  override def validateOnUpdate(originalWorkflow: WorkflowJoined, updatedWorkflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Unit] = {
    val validators = Seq(
      validateWorkflowIsUnique(updatedWorkflow),
      validateProjectIsNotEmpty(updatedWorkflow),
      validateWorkflowData(originalWorkflow, updatedWorkflow)
    )
    ValidationServiceUtil.reduce(validators).transform(identity, {
      case ex: ApiException => new ApiException(ex.apiErrors.map(_.unwrapError()))
    })
  }

  private def validateWorkflowNotExists(workflows: Seq[WorkflowJoined])(implicit ec: ExecutionContext): Future[Seq[ApiError]] = {
    workflowRepository.existsWorkflows(workflows.map(_.name)).map(
      existingNames => workflows
        .filter(workflow => existingNames.contains(workflow.name))
        .map(workflow => BulkOperationError(workflow, ValidationError("Workflow name already exists")))
    )
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
    validateProjectIsNotEmpty(Seq(workflow))
  }

  private def validateProjectIsNotEmpty(workflows: Seq[WorkflowJoined]): Future[Seq[ApiError]] = {
    val errors = workflows.map(workflow => Option(workflow.project) match {
        case Some(v) if v.isEmpty => Some(BulkOperationError(workflow, ValidationError("Project must not be empty")))
        case Some(_) => None
        case None => Some(BulkOperationError(workflow, ValidationError("Project must be set")))
      })
      .filter(_.isDefined)
      .map(_.get)

    Future.successful(errors)
  }

  private[services] def validateWorkflowData(originalWorkflow: WorkflowJoined, updatedWorkflow: WorkflowJoined)(implicit ec: ExecutionContext): Future[Seq[ApiError]] = {
    val workflowDetailsVerification = Seq(
      originalWorkflow.name == updatedWorkflow.name,
      originalWorkflow.isActive == updatedWorkflow.isActive,
      originalWorkflow.project == updatedWorkflow.project
    )

    val workflowSensorVerification =  validateSensorProperties(
      originalWorkflow.sensor.properties,
      updatedWorkflow.sensor.properties
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
            validateJobParameters(originalJob.jobParameters, updatedJob.jobParameters)
          )
        ).getOrElse(Seq(false))
      })
    ).flatten

    if((workflowDetailsVerification ++ workflowJobsVerification :+ workflowSensorVerification).contains(false)) {
      Future.successful(Seq())
    } else {
      Future.successful(Seq(ValidationError("Nothing to update")))
    }
  }

  private def validateSensorProperties(originalSensorProperties: SensorProperties, updatedSensorProperties: SensorProperties): Boolean = {
    (originalSensorProperties, updatedSensorProperties) match {
      case (original: KafkaSensorProperties, updated: KafkaSensorProperties) => original.equals(updated)
      case (original: AbsaKafkaSensorProperties, updated: AbsaKafkaSensorProperties) => original.equals(updated)
      case (original: RecurringSensorProperties, updated: RecurringSensorProperties) => original.equals(updated)
      case (original: TimeSensorProperties, updated: TimeSensorProperties) => original.equals(updated)
      case _ => false
    }
  }

  private def validateJobParameters(originalJobParameters: JobDefinitionParameters, updatedJobParameters: JobDefinitionParameters): Boolean = {
    (originalJobParameters, updatedJobParameters) match {
      case (original: SparkDefinitionParameters, updated: SparkDefinitionParameters) => original.equals(updated)
      case (original: HyperdriveDefinitionParameters, updated: HyperdriveDefinitionParameters) => original.equals(updated)
      case (original: ShellDefinitionParameters, updated: ShellDefinitionParameters) => original.equals(updated)
      case _ => false
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
