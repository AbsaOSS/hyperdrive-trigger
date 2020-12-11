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
import za.co.absa.hyperdrive.trigger.api.rest.utils.JobTemplateResolutionUtil
import za.co.absa.hyperdrive.trigger.models.search.{TableSearchRequest, TableSearchResponse}
import za.co.absa.hyperdrive.trigger.models.{DagDefinitionJoined, JobTemplate, ResolvedJobDefinition}
import za.co.absa.hyperdrive.trigger.persistance.JobTemplateRepository

import scala.concurrent.{ExecutionContext, Future}

trait JobTemplateService {
  val jobTemplateRepository: JobTemplateRepository

  def getJobTemplate(id: Long)(implicit ec: ExecutionContext): Future[JobTemplate]
  def resolveJobTemplate(dagDefinition: DagDefinitionJoined)(implicit ec: ExecutionContext): Future[Seq[ResolvedJobDefinition]]
  def getJobTemplates()(implicit ec: ExecutionContext): Future[Seq[JobTemplate]]
  def getJobTemplatesByIds(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[JobTemplate]]
  def getJobTemplateIdsByNames(names: Seq[String])(implicit ec: ExecutionContext): Future[Map[String, Long]]
  def searchJobTemplates(searchRequest: TableSearchRequest)(implicit ec: ExecutionContext): Future[TableSearchResponse[JobTemplate]]
}

@Service
class JobTemplateServiceImpl(override val jobTemplateRepository: JobTemplateRepository) extends JobTemplateService {
  override def getJobTemplate(id: Long)(implicit ec: ExecutionContext): Future[JobTemplate] = {
    jobTemplateRepository.getJobTemplate(id)
  }

  override def resolveJobTemplate(dagDefinitionJoined: DagDefinitionJoined)(implicit ec: ExecutionContext): Future[Seq[ResolvedJobDefinition]] = {
    val jobTemplateIds = dagDefinitionJoined.jobDefinitions.map(_.jobTemplateId)
    jobTemplateRepository.getJobTemplatesByIds(jobTemplateIds).map(
      jobTemplates => JobTemplateResolutionUtil.resolveDagDefinitionJoined(dagDefinitionJoined, jobTemplates)
    )
  }

  override def getJobTemplates()(implicit ec: ExecutionContext): Future[Seq[JobTemplate]] =
    jobTemplateRepository.getJobTemplates()

  override def getJobTemplatesByIds(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[JobTemplate]] =
    jobTemplateRepository.getJobTemplatesByIds(ids)

  override def getJobTemplateIdsByNames(names: Seq[String])(implicit ec: ExecutionContext): Future[Map[String, Long]] =
    jobTemplateRepository.getJobTemplateIdsByNames(names)

  override def searchJobTemplates(searchRequest: TableSearchRequest)(implicit ec: ExecutionContext): Future[TableSearchResponse[JobTemplate]] = {
    jobTemplateRepository.searchJobTemplates(searchRequest)
  }
}
