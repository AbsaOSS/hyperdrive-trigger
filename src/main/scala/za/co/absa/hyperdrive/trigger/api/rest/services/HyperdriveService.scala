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
import za.co.absa.hyperdrive.trigger.models.{IngestionStatus, JobIngestionStatus}
import za.co.absa.hyperdrive.trigger.persistance.WorkflowRepository
import za.co.absa.hyperdrive.trigger.configuration.application.GeneralConfig

import scala.concurrent.{ExecutionContext, Future}

trait HyperdriveService {
  val workflowRepository: WorkflowRepository
  val jobTemplateService: JobTemplateService
  val hyperdriveOffsetComparisonService: HyperdriveOffsetComparisonService

  def getIngestionStatus(id: Long)(implicit ec: ExecutionContext): Future[IngestionStatus]
}

@Service
class HyperdriveServiceImpl(
  override val workflowRepository: WorkflowRepository,
  override val jobTemplateService: JobTemplateService,
  override val hyperdriveOffsetComparisonService: HyperdriveOffsetComparisonService,
  generalConfig: GeneralConfig
) extends HyperdriveService {

  override def getIngestionStatus(id: Long)(implicit ec: ExecutionContext): Future[IngestionStatus] = {
    workflowRepository.getWorkflow(id).flatMap { workflow =>
      jobTemplateService
        .resolveJobTemplate(workflow.dagDefinitionJoined)
        .flatMap(resolvedJobs =>
          Future.sequence(
            resolvedJobs.map(resolvedJob =>
              hyperdriveOffsetComparisonService
                .getNumberOfMessagesLeft(resolvedJob.jobParameters)
                .map(messagesLeft =>
                  JobIngestionStatus(
                    jobName = resolvedJob.name,
                    jobType = resolvedJob.jobParameters.jobType,
                    topic = messagesLeft.map(_._1).getOrElse("Unknown"),
                    messagesToIngest = messagesLeft.map(_._2)
                  )
                )
            )
          )
        )
        .map(jobIngestionStatus =>
          IngestionStatus(
            name = workflow.name,
            project = workflow.project,
            jobIngestionStatus = jobIngestionStatus,
            id = workflow.id
          )
        )
    }
  }
}
