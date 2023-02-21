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

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.models.{IngestionStatus, Topic}
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.persistance.WorkflowRepository

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

trait HyperdriveService {
  val workflowRepository: WorkflowRepository
  val jobTemplateService: JobTemplateService
  val hyperdriveOffsetComparisonService: HyperdriveOffsetService

  def getIngestionStatus(id: Long)(implicit ec: ExecutionContext): Future[Seq[IngestionStatus]]
}

@Service
class HyperdriveServiceImpl(
  override val workflowRepository: WorkflowRepository,
  override val jobTemplateService: JobTemplateService,
  override val hyperdriveOffsetComparisonService: HyperdriveOffsetService
) extends HyperdriveService {
  private val logger = LoggerFactory.getLogger(this.getClass)

  override def getIngestionStatus(id: Long)(implicit ec: ExecutionContext): Future[Seq[IngestionStatus]] = {
    workflowRepository.getWorkflow(id).flatMap { workflow =>
      jobTemplateService
        .resolveJobTemplate(workflow.dagDefinitionJoined)
        .flatMap(resolvedJobs =>
          Future.sequence(
            resolvedJobs.map {
              case resolvedJob if resolvedJob.jobParameters.jobType == JobTypes.Hyperdrive =>
                hyperdriveOffsetComparisonService.getNumberOfMessagesLeft(resolvedJob.jobParameters).transformWith {
                  case Failure(exception) =>
                    logger.error(s"Failed to get number of messages left to ingest for a workflow: $id", exception)
                    Future(
                      IngestionStatus(
                        jobName = resolvedJob.name,
                        jobType = resolvedJob.jobParameters.jobType.name,
                        topic = None
                      )
                    )
                  case Success(messagesLeftOpt) =>
                    Future(
                      IngestionStatus(
                        jobName = resolvedJob.name,
                        jobType = resolvedJob.jobParameters.jobType.name,
                        topic = messagesLeftOpt.map(messagesLeft => Topic(messagesLeft._1, messagesLeft._2))
                      )
                    )
                }
              case resolvedJob =>
                Future(
                  IngestionStatus(
                    jobName = resolvedJob.name,
                    jobType = resolvedJob.jobParameters.jobType.name,
                    topic = None
                  )
                )
            }
          )
        )
    }
  }
}
