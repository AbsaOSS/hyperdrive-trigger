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

package za.co.absa.hyperdrive.trigger.persistance

import org.slf4j.LoggerFactory
import org.springframework.stereotype
import za.co.absa.hyperdrive.trigger.models.errors.{ApiError, GenericDatabaseError}
import za.co.absa.hyperdrive.trigger.models.JobTemplate

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

trait JobTemplateRepository extends Repository {
  def insertJobTemplate(jobTemplate: JobTemplate)(implicit ec: ExecutionContext): Future[Either[ApiError, Long]]
  def getJobTemplatesByIds(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[JobTemplate]]
  def getJobTemplates()(implicit ec: ExecutionContext): Future[Seq[JobTemplate]]
}

@stereotype.Repository
class JobTemplateRepositoryImpl extends JobTemplateRepository {
  import profile.api._
  private val logger = LoggerFactory.getLogger(this.getClass)

  override def getJobTemplatesByIds(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[JobTemplate]] = db.run(
    jobTemplateTable.filter(_.id inSetBind ids).result
  )

  override def getJobTemplates()(implicit ec: ExecutionContext): Future[Seq[JobTemplate]] = db.run(
    jobTemplateTable.sortBy(_.name).result
  )

  override def insertJobTemplate(jobTemplate: JobTemplate)(implicit ec: ExecutionContext): Future[Either[ApiError, Long]] = {
    db.run(
      (for {
        jobTemplateId <- jobTemplateTable returning jobTemplateTable.map(_.id) += jobTemplate
      } yield {
        jobTemplateId
      }).transactionally.asTry.map {
        case Success(jobTemplateId) => Right(jobTemplateId)
        case Failure(ex) =>
          logger.error(s"Unexpected error occurred when inserting jobTemplate $jobTemplate", ex)
          Left(GenericDatabaseError)
      }
    )
  }
}
