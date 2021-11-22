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
import za.co.absa.hyperdrive.trigger.models.search.{TableSearchRequest, TableSearchResponse}
import za.co.absa.hyperdrive.trigger.models.{DagDefinitionJoined, JobTemplate, ResolvedJobDefinition, Workflow}
import za.co.absa.hyperdrive.trigger.persistance.JobTemplateRepository

import scala.concurrent.{ExecutionContext, Future}

trait JobTemplateService {
  val jobTemplateRepository: JobTemplateRepository
  val jobTemplateValidationService: JobTemplateValidationService

  def getJobTemplate(id: Long)(implicit ec: ExecutionContext): Future[JobTemplate]
  def resolveJobTemplate(dagDefinition: DagDefinitionJoined)(implicit ec: ExecutionContext): Future[Seq[ResolvedJobDefinition]]
  def getJobTemplates()(implicit ec: ExecutionContext): Future[Seq[JobTemplate]]
  def getJobTemplatesByIds(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[JobTemplate]]
  def getJobTemplateIdsByNames(names: Seq[String])(implicit ec: ExecutionContext): Future[Map[String, Long]]
  def searchJobTemplates(searchRequest: TableSearchRequest)(implicit ec: ExecutionContext): Future[TableSearchResponse[JobTemplate]]
  def createJobTemplate(jobTemplate: JobTemplate)(implicit ec: ExecutionContext): Future[JobTemplate]
  def updateJobTemplate(jobTemplate: JobTemplate)(implicit ec: ExecutionContext): Future[JobTemplate]
  def deleteJobTemplate(id: Long)(implicit ec: ExecutionContext): Future[Boolean]
  def getJobTemplateUsage(id: Long): Future[Seq[Workflow]]
}

@Service
class JobTemplateServiceImpl(override val jobTemplateRepository: JobTemplateRepository, jobTemplateResolutionService: JobTemplateResolutionService, override val jobTemplateValidationService: JobTemplateValidationService) extends JobTemplateService with UserDetailsService {
  override def getJobTemplate(id: Long)(implicit ec: ExecutionContext): Future[JobTemplate] = {
    jobTemplateRepository.getJobTemplate(id)
  }

  override def resolveJobTemplate(dagDefinitionJoined: DagDefinitionJoined)(implicit ec: ExecutionContext): Future[Seq[ResolvedJobDefinition]] = {
    val jobTemplateIds = dagDefinitionJoined.jobDefinitions.flatMap(_.jobTemplateId)
    jobTemplateRepository.getJobTemplatesByIds(jobTemplateIds).map(
      jobTemplates => jobTemplateResolutionService.resolveDagDefinitionJoined(dagDefinitionJoined, jobTemplates)
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

  override def createJobTemplate(jobTemplate: JobTemplate)(implicit ec: ExecutionContext): Future[JobTemplate] = {
    val userName = getUserName.apply()
    for {
      _ <- jobTemplateValidationService.validate(jobTemplate)
      jobTemplateId <- jobTemplateRepository.insertJobTemplate(jobTemplate, userName)
    } yield {
      jobTemplate.copy(id = jobTemplateId)
    }
  }

  override def updateJobTemplate(jobTemplate: JobTemplate)(implicit ec: ExecutionContext): Future[JobTemplate] = {
    val userName = getUserName.apply()
    for {
      _ <- jobTemplateValidationService.validate(jobTemplate)
      _ <- jobTemplateRepository.updateJobTemplate(jobTemplate, userName)
    } yield {
      jobTemplate
    }
  }

  override def deleteJobTemplate(id: Long)(implicit ec: ExecutionContext): Future[Boolean] = {
    val userName = getUserName.apply()
    jobTemplateRepository.deleteJobTemplate(id, userName).map(_ => true)
  }

  override def getJobTemplateUsage(id: Long): Future[Seq[Workflow]] =
    jobTemplateRepository.getJobTemplateUsage(id)
}
