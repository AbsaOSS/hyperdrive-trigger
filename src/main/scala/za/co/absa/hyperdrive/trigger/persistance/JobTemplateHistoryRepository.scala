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

import java.time.LocalDateTime
import org.springframework.stereotype
import za.co.absa.hyperdrive.trigger.models.enums.DBOperation.{Create, DBOperation, Delete, Update}
import za.co.absa.hyperdrive.trigger.models._

import javax.inject.Inject
import scala.concurrent.{ExecutionContext, Future}

trait JobTemplateHistoryRepository extends Repository {
  import slick.dbio.DBIO

  private[persistance] def create(jobTemplate: JobTemplate, user: String)(implicit ec: ExecutionContext): DBIO[Long]
  private[persistance] def update(jobTemplate: JobTemplate, user: String)(implicit ec: ExecutionContext): DBIO[Long]
  private[persistance] def delete(jobTemplate: JobTemplate, user: String)(implicit ec: ExecutionContext): DBIO[Long]

  def getHistoryForJobTemplate(jobTemplateId: Long)(implicit ec: ExecutionContext): Future[Seq[History]]
  def getJobTemplateFromHistory(jobTemplateHistoryId: Long)(implicit ec: ExecutionContext): Future[JobTemplate]
  def getJobTemplatesFromHistory(leftJobTemplateHistoryId: Long, rightJobTemplateHistoryId: Long)(implicit
    ec: ExecutionContext
  ): Future[HistoryPair[JobTemplateHistory]]
}

@stereotype.Repository
class JobTemplateHistoryRepositoryImpl @Inject() (val dbProvider: DatabaseProvider)
    extends JobTemplateHistoryRepository {
  import api._

  private def insert(jobTemplate: JobTemplate, user: String, operation: DBOperation)(implicit
    ec: ExecutionContext
  ): DBIO[Long] = {
    val jobTemplateHistory = JobTemplateHistory(
      history = History(changedOn = LocalDateTime.now(), changedBy = user, operation = operation),
      jobTemplateId = jobTemplate.id,
      jobTemplate = jobTemplate
    )
    jobTemplateHistoryTable returning jobTemplateHistoryTable.map(_.id) += jobTemplateHistory
  }

  override private[persistance] def create(jobTemplate: JobTemplate, user: String)(implicit
    ec: ExecutionContext
  ): DBIO[Long] =
    this.insert(jobTemplate, user, Create)

  override private[persistance] def update(jobTemplate: JobTemplate, user: String)(implicit
    ec: ExecutionContext
  ): DBIO[Long] =
    this.insert(jobTemplate, user, Update)

  override private[persistance] def delete(jobTemplate: JobTemplate, user: String)(implicit
    ec: ExecutionContext
  ): DBIO[Long] =
    this.insert(jobTemplate, user, Delete)

  override def getHistoryForJobTemplate(jobTemplateId: Long)(implicit ec: ExecutionContext): Future[Seq[History]] =
    db.run(jobTemplateHistoryTable.getHistoryForEntity(jobTemplateId).withErrorHandling())

  override def getJobTemplateFromHistory(jobTemplateHistoryId: Long)(implicit
    ec: ExecutionContext
  ): Future[JobTemplate] =
    db.run(jobTemplateHistoryTable.getHistoryEntity(jobTemplateHistoryId).map(_.jobTemplate).withErrorHandling())

  override def getJobTemplatesFromHistory(leftJobTemplateHistoryId: Long, rightJobTemplateHistoryId: Long)(implicit
    ec: ExecutionContext
  ): Future[HistoryPair[JobTemplateHistory]] =
    db.run(
      jobTemplateHistoryTable
        .getEntitiesFromHistory(leftJobTemplateHistoryId, rightJobTemplateHistoryId)
        .withErrorHandling()
    )
}
