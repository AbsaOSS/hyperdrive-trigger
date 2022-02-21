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
import za.co.absa.hyperdrive.trigger.models.{History, HistoryPair, JobTemplate, JobTemplateHistory}
import za.co.absa.hyperdrive.trigger.persistance.JobTemplateHistoryRepository

import scala.concurrent.{ExecutionContext, Future}

trait JobTemplateHistoryService {
  val jobTemplateHistoryRepository: JobTemplateHistoryRepository

  def getHistoryForJobTemplate(jobTemplateId: Long)(implicit ec: ExecutionContext): Future[Seq[History]]
  def getJobTemplateFromHistory(jobTemplateHistoryId: Long)(implicit ec: ExecutionContext): Future[JobTemplate]
  def getJobTemplatesFromHistory(leftJobTemplateHistoryId: Long, rightJobTemplateHistoryId: Long)(implicit ec: ExecutionContext): Future[HistoryPair[JobTemplateHistory]]
}

@Service
class JobTemplateHistoryServiceImpl(override val jobTemplateHistoryRepository: JobTemplateHistoryRepository) extends JobTemplateHistoryService {
  override def getHistoryForJobTemplate(jobTemplateId: Long)(implicit ec: ExecutionContext): Future[Seq[History]] = {
    jobTemplateHistoryRepository.getHistoryForJobTemplate(jobTemplateId)
  }

  override def getJobTemplateFromHistory(jobTemplateHistoryId: Long)(implicit ec: ExecutionContext): Future[JobTemplate] = {
    jobTemplateHistoryRepository.getJobTemplateFromHistory(jobTemplateHistoryId)
  }

  override def getJobTemplatesFromHistory(leftJobTemplateHistoryId: Long, rightJobTemplateHistoryId: Long)(implicit ec: ExecutionContext): Future[HistoryPair[JobTemplateHistory]] = {
    jobTemplateHistoryRepository.getJobTemplatesFromHistory(leftJobTemplateHistoryId, rightJobTemplateHistoryId)
  }
}
