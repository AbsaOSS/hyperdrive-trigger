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

import org.springframework.stereotype
import za.co.absa.hyperdrive.trigger.models.errors.{ApiException, ValidationError}
import za.co.absa.hyperdrive.trigger.models.{JobTemplate, Workflow}
import za.co.absa.hyperdrive.trigger.models.search.{TableSearchRequest, TableSearchResponse}

import javax.inject.Inject
import scala.concurrent.{ExecutionContext, Future}

trait JobTemplateRepository extends Repository {
  val jobTemplateHistoryRepository: JobTemplateHistoryRepository

  def getJobTemplate(id: Long)(implicit ec: ExecutionContext): Future[JobTemplate]
  def insertJobTemplate(jobTemplate: JobTemplate, user: String)(implicit ec: ExecutionContext): Future[Long]
  def getJobTemplatesByIds(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[JobTemplate]]
  def getJobTemplates()(implicit ec: ExecutionContext): Future[Seq[JobTemplate]]
  def getJobTemplateIdsByNames(names: Seq[String])(implicit ec: ExecutionContext): Future[Map[String, Long]]
  def searchJobTemplates(searchRequest: TableSearchRequest)(implicit
    ec: ExecutionContext
  ): Future[TableSearchResponse[JobTemplate]]
  def updateJobTemplate(jobTemplate: JobTemplate, user: String)(implicit ec: ExecutionContext): Future[Unit]
  def deleteJobTemplate(id: Long, user: String)(implicit ec: ExecutionContext): Future[Unit]
  def existsOtherJobTemplate(name: String, id: Long)(implicit ec: ExecutionContext): Future[Boolean]
  def getWorkflowsByJobTemplate(id: Long)(implicit ec: ExecutionContext): Future[Seq[Workflow]]
}

@stereotype.Repository
class JobTemplateRepositoryImpl @Inject() (
  val dbProvider: DatabaseProvider,
  override val jobTemplateHistoryRepository: JobTemplateHistoryRepository
) extends JobTemplateRepository {
  import api._

  override def getJobTemplate(id: Long)(implicit ec: ExecutionContext): Future[JobTemplate] = db.run(
    jobTemplateTable
      .filter(_.id === id)
      .result
      .withErrorHandling()
      .map(
        _.headOption.getOrElse(throw new ApiException(ValidationError(s"Job template with id ${id} does not exist.")))
      )
  )

  override def getJobTemplatesByIds(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[JobTemplate]] =
    db.run(jobTemplateTable.filter(_.id inSetBind ids).result.withErrorHandling())

  override def insertJobTemplate(jobTemplate: JobTemplate, user: String)(implicit ec: ExecutionContext): Future[Long] =
    db.run((for {
      jobTemplateId <- jobTemplateTable returning jobTemplateTable.map(_.id) += jobTemplate
      insertedJobTemplate <- getSingleJobTemplate(jobTemplateId)
      _ <- jobTemplateHistoryRepository.create(insertedJobTemplate, user)
    } yield {
      jobTemplateId
    }).transactionally.withErrorHandling(s"Unexpected error occurred when inserting jobTemplate $jobTemplate"))

  override def getJobTemplates()(implicit ec: ExecutionContext): Future[Seq[JobTemplate]] =
    db.run(jobTemplateTable.result.withErrorHandling())

  override def getJobTemplateIdsByNames(names: Seq[String])(implicit ec: ExecutionContext): Future[Map[String, Long]] =
    db.run(
      jobTemplateTable
        .filter(_.name inSetBind names)
        .map(jobTemplate => jobTemplate.name -> jobTemplate.id)
        .result
        .withErrorHandling()
    ).flatMap(seq => Future(seq.toMap))

  override def searchJobTemplates(searchRequest: TableSearchRequest)(implicit
    ec: ExecutionContext
  ): Future[TableSearchResponse[JobTemplate]] =
    db.run(jobTemplateTable.search(searchRequest).withErrorHandling())

  private def getSingleJobTemplate(id: Long)(implicit ec: ExecutionContext): DBIO[JobTemplate] =
    jobTemplateTable
      .filter(_.id === id)
      .result
      .withErrorHandling()
      .map { jobTemplates =>
        jobTemplates.headOption
          .getOrElse(throw new ApiException(ValidationError(s"Job template with id ${id} does not exist.")))
      }

  override def updateJobTemplate(jobTemplate: JobTemplate, user: String)(implicit ec: ExecutionContext): Future[Unit] =
    db.run((for {
      _ <- jobTemplateTable.filter(_.id === jobTemplate.id).update(jobTemplate)
      updatedJobTemplate <- getSingleJobTemplate(jobTemplate.id)
      _ <- jobTemplateHistoryRepository.update(updatedJobTemplate, user)
    } yield {
      (): Unit
    }).transactionally.withErrorHandling(s"Unexpected error occurred when updating job template $jobTemplate"))

  override def deleteJobTemplate(id: Long, user: String)(implicit ec: ExecutionContext): Future[Unit] =
    db.run(
      getSingleJobTemplate(id)
        .flatMap(jobTemplate => jobTemplateHistoryRepository.delete(jobTemplate, user))
        .flatMap(_ =>
          jobTemplateTable.filter(_.id === id).delete andThen
            DBIO.successful((): Unit)
        )
        .transactionally
        .withErrorHandling(s"Unexpected error occurred when deleting job template $id")
    )

  override def existsOtherJobTemplate(name: String, id: Long)(implicit ec: ExecutionContext): Future[Boolean] = db.run(
    jobTemplateTable
      .filter(_.name === name)
      .filter(_.id =!= id)
      .exists
      .result
      .withErrorHandling()
  )

  override def getWorkflowsByJobTemplate(id: Long)(implicit ec: ExecutionContext): Future[Seq[Workflow]] = db.run(
    (
      for {
        dagDefinitionId <- jobDefinitionTable.filter(_.jobTemplateId === id).map(_.dagDefinitionId).distinct
        workflowId <- dagDefinitionTable.filter(_.id === dagDefinitionId).map(_.workflowId)
        workflow <- workflowTable.filter(_.id === workflowId)
      } yield {
        workflow
      }
    ).result.withErrorHandling()
  )
}
