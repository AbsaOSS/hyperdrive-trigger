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

package za.co.absa.hyperdrive.trigger.models.tables

import java.time.LocalDateTime

import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.JobStatus
import za.co.absa.hyperdrive.trigger.models._
import slick.lifted.{ForeignKeyQuery, ProvenShape}

trait JobInstanceTable {
  this: Profile with JdbcTypeMapper with DagInstanceTable =>
  import api._

  final class JobInstanceTable(tag: Tag) extends Table[JobInstance](tag, _tableName = "job_instance") {

    def jobName: Rep[String] = column[String]("job_name")
    def jobParameters: Rep[JobInstanceParameters] = column[JobInstanceParameters]("job_parameters", O.SqlType("JSONB"))
    def jobStatus: Rep[JobStatus] = column[JobStatus]("job_status")
    def executorJobId: Rep[Option[String]] = column[Option[String]]("executor_job_id")
    def applicationId: Rep[Option[String]] = column[Option[String]]("application_id")
    def created: Rep[LocalDateTime] = column[LocalDateTime]("created")
    def updated: Rep[Option[LocalDateTime]] = column[Option[LocalDateTime]]("updated")
    def order: Rep[Int] = column[Int]("order")
    def dagInstanceId: Rep[Long] = column[Long]("dag_instance_id")
    def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))

    def dagInstance_fk: ForeignKeyQuery[DagInstanceTable, DagInstance] =
      foreignKey("job_instance_dag_instance_fk", dagInstanceId, TableQuery[DagInstanceTable])(_.id)

    def * : ProvenShape[JobInstance] = (
      jobName,
      jobParameters,
      jobStatus,
      executorJobId,
      applicationId,
      created,
      updated,
      order,
      dagInstanceId,
      id
    ) <> (
      jobInstanceTuple =>
        JobInstance.apply(
          jobName = jobInstanceTuple._1,
          jobParameters = jobInstanceTuple._2,
          jobStatus = jobInstanceTuple._3,
          executorJobId = jobInstanceTuple._4,
          applicationId = jobInstanceTuple._5,
          created = jobInstanceTuple._6,
          updated = jobInstanceTuple._7,
          order = jobInstanceTuple._8,
          dagInstanceId = jobInstanceTuple._9,
          id = jobInstanceTuple._10
        ),
      (jobInstance: JobInstance) =>
        Option(
          jobInstance.jobName,
          jobInstance.jobParameters,
          jobInstance.jobStatus,
          jobInstance.executorJobId,
          jobInstance.applicationId,
          jobInstance.created,
          jobInstance.updated,
          jobInstance.order,
          jobInstance.dagInstanceId,
          jobInstance.id
        )
    )

  }

  lazy val jobInstanceTable = TableQuery[JobInstanceTable]

}
