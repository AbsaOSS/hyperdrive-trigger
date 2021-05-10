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
import za.co.absa.hyperdrive.trigger.models.JobInstance
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.JobStatus

import scala.concurrent.{ExecutionContext, Future}

trait JobInstanceRepository extends Repository {
  def updateJob(job: JobInstance)(implicit ec: ExecutionContext): Future[Unit]
  def updateJobsStatus(ids: Seq[Long], status: JobStatus)(implicit ec: ExecutionContext): Future[Unit]
  def getJobInstances(dagInstanceId: Long)(implicit ec: ExecutionContext): Future[Seq[JobInstance]]
}

@stereotype.Repository
class JobInstanceRepositoryImpl extends JobInstanceRepository {
  import api._

  override def updateJob(job: JobInstance)(implicit ec: ExecutionContext): Future[Unit] = db.run {
    jobInstanceTable.filter(_.id === job.id).update(job.copy(updated = Option(LocalDateTime.now()))).andThen(DBIO.successful((): Unit))
  }

  def updateJobsStatus(ids: Seq[Long], status: JobStatus)(implicit ec: ExecutionContext): Future[Unit] = db.run(
    jobInstanceTable.filter(_.id inSet ids).map(ji => (ji.jobStatus, ji.updated)).update((status, Option(LocalDateTime.now()))).transactionally
  ).map(_ => (): Unit)

  override def getJobInstances(dagInstanceId: Long)(implicit ec: ExecutionContext): Future[Seq[JobInstance]] = db.run(
    jobInstanceTable.filter(_.dagInstanceId === dagInstanceId).sortBy(_.id).result
  )

}
