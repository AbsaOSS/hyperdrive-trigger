/*
 * Copyright 2018-2019 ABSA Group Limited
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
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType
import za.co.absa.hyperdrive.trigger.models._
import slick.lifted.{ForeignKeyQuery, ProvenShape}
import za.co.absa.hyperdrive.trigger.models.tables.JdbcTypeMapper._
import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._

final class JobInstanceTable(tag: Tag) extends Table[JobInstance](tag, _tableName = "job_instance") {

  def jobName: Rep[String] = column[String]("job_name")
  def jobType: Rep[JobType] = column[JobType]("job_type")
  def variables: Rep[Map[String, String]] = column[Map[String, String]]("variables")
  def maps: Rep[Map[String, Set[String]]] = column[Map[String, Set[String]]]("maps")
  def jobStatus: Rep[JobStatus] = column[JobStatus]("job_status")
  def executorJobId: Rep[Option[String]] = column[Option[String]]("executor_job_id")
  def created: Rep[LocalDateTime] = column[LocalDateTime]("created")
  def updated: Rep[Option[LocalDateTime]] = column[Option[LocalDateTime]]("updated")
  def order: Rep[Int] = column[Int]("order")
  def dagInstanceId: Rep[Long] = column[Long]("dag_instance_id")
  def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))

  def dagInstance_fk: ForeignKeyQuery[DagInstanceTable, DagInstance] =
      foreignKey("job_instance_dag_instance_fk", dagInstanceId, TableQuery[DagInstanceTable])(_.id)

  def * : ProvenShape[JobInstance] = (
    jobName,
    jobType,
    variables,
    maps,
    jobStatus,
    executorJobId,
    created,
    updated,
    order,
    dagInstanceId,
    id
  ) <> (
    jobInstanceTuple =>
      JobInstance.apply(
        jobName = jobInstanceTuple._1,
        jobType = jobInstanceTuple._2,
        jobParameters = JobParameters(
          variables = jobInstanceTuple._3,
          maps = jobInstanceTuple._4
        ),
        jobStatus = jobInstanceTuple._5,
        executorJobId = jobInstanceTuple._6,
        created = jobInstanceTuple._7,
        updated = jobInstanceTuple._8,
        order = jobInstanceTuple._9,
        dagInstanceId = jobInstanceTuple._10,
        id = jobInstanceTuple._11
      ),
    (jobInstance: JobInstance) =>
      Option(
        jobInstance.jobName,
        jobInstance.jobType,
        jobInstance.jobParameters.variables,
        jobInstance.jobParameters.maps,
        jobInstance.jobStatus,
        jobInstance.executorJobId,
        jobInstance.created,
        jobInstance.updated,
        jobInstance.order,
        jobInstance.dagInstanceId,
        jobInstance.id
      )
  )

}