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
import za.co.absa.hyperdrive.trigger.models.{JobForRun, JobTemplate}

import scala.concurrent.{ExecutionContext, Future}

trait JobTemplateRepository extends Repository {
  def getJobTemplate(id: Long)(implicit ec: ExecutionContext): Future[JobTemplate]
  def getJobTemplates()(implicit ec: ExecutionContext): Future[Seq[JobTemplate]]
}

@stereotype.Repository
class JobTemplateRepositoryImpl extends JobTemplateRepository {
  import profile.api._

  override def getJobTemplate(id: Long)(implicit ec: ExecutionContext): Future[JobTemplate] = db.run(
    jobTemplateTable.filter(_.id === id).result.map(
      jobTemplate => jobTemplate.headOption.getOrElse(throw new Exception(s"JobTemplate with ${id} does not exist."))
    )
  )

  override def getJobTemplates()(implicit ec: ExecutionContext): Future[Seq[JobTemplate]] = db.run(
    jobTemplateTable.sortBy(_.name).result
  )
}
