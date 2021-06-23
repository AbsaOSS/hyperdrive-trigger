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

import java.time.LocalDateTime

import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.models.enums.{DagInstanceStatuses, JobStatuses, JobTypes}
import za.co.absa.hyperdrive.trigger.models.{DagDefinitionJoined, DagInstanceJoined, JobInstance, ResolvedJobDefinition}

import scala.concurrent.{ExecutionContext, Future}

trait DagInstanceService {
  val jobTemplateService: JobTemplateService
  def createDagInstance(dagDefinitionJoined: DagDefinitionJoined, triggeredBy: String, skip: Boolean = false)(implicit ec: ExecutionContext): Future[DagInstanceJoined]
}

@Service
class DagInstanceServiceImpl(override val jobTemplateService: JobTemplateService) extends DagInstanceService {

  override def createDagInstance(dagDefinitionJoined: DagDefinitionJoined, triggeredBy: String, skip: Boolean)(implicit ec: ExecutionContext): Future[DagInstanceJoined] = {
    val initialDagInstanceStatus = if (skip) DagInstanceStatuses.Skipped else DagInstanceStatuses.InQueue
    val now = LocalDateTime.now()
    val finished = if (skip) Some(now) else None
    jobTemplateService.resolveJobTemplate(dagDefinitionJoined).flatMap(
      resolvedJobDefinitions => Future {
        DagInstanceJoined(
          status = initialDagInstanceStatus,
          triggeredBy = triggeredBy,
          workflowId = dagDefinitionJoined.workflowId,
          jobInstances = createJobInstances(resolvedJobDefinitions, skip),
          started = now,
          finished = finished
        )
      }
    )
  }

  private def createJobInstances(resolvedJobDefinitions: Seq[ResolvedJobDefinition], skip: Boolean): Seq[JobInstance] = {
    val initialJobStatus = if (skip) JobStatuses.Skipped else JobStatuses.InQueue
    val now = LocalDateTime.now()
    val finished = if (skip) Some(now) else None
    resolvedJobDefinitions.map { resolvedJobDefinition =>
      val jobParameters = resolvedJobDefinition.jobParameters
      JobInstance(
        jobName = resolvedJobDefinition.name,
        jobParameters = jobParameters,
        jobStatus = initialJobStatus,
        executorJobId = None,
        applicationId = None,
        created = now,
        updated = finished,
        order = resolvedJobDefinition.order,
        dagInstanceId = 0
      )
    }
  }
}
