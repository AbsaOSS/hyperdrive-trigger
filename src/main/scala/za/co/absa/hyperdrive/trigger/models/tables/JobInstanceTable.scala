package za.co.absa.hyperdrive.trigger.models.tables

import java.time.LocalDateTime

import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.JobStatus
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType
import za.co.absa.hyperdrive.trigger.models.{Event, JobDefinition, JobInstance, JobParameters}
import slick.lifted.{ForeignKeyQuery, ProvenShape}
import za.co.absa.hyperdrive.trigger.models.tables.JdbcTypeMapper._
import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._

final class JobInstanceTable(tag: Tag) extends Table[JobInstance](tag, _tableName = "job_instance") {

  def jobName: Rep[String] = column[String]("job_name")
  def jobDefinitionId: Rep[Long] = column[Long]("job_definition_id")
  def sensorEventId: Rep[String] = column[String]("sensor_event_id", O.Unique, O.Length(70))
  def jobType: Rep[JobType] = column[JobType]("job_type")
  def variables: Rep[Map[String, String]] = column[Map[String, String]]("variables")
  def maps: Rep[Map[String, Set[String]]] = column[Map[String, Set[String]]]("maps")
  def jobStatus: Rep[JobStatus] = column[JobStatus]("job_status")
  def executorJobId: Rep[Option[String]] = column[Option[String]]("executor_job_id")
  def created: Rep[LocalDateTime] = column[LocalDateTime]("created")
  def updated: Rep[Option[LocalDateTime]] = column[Option[LocalDateTime]]("updated")
  def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))

  def jobDefinition_fk: ForeignKeyQuery[JobDefinitionTable, JobDefinition] =
      foreignKey("job_instance_job_definition_fk", jobDefinitionId, TableQuery[JobDefinitionTable])(_.id)

  def sensorEvent_fk: ForeignKeyQuery[EventTable, Event] =
    foreignKey("job_instance_sensor_event_fk", sensorEventId, TableQuery[EventTable])(_.sensorEventId)
  
  def * : ProvenShape[JobInstance] = (
    jobName,
    jobDefinitionId,
    sensorEventId,
    jobType,
    variables,
    maps,
    jobStatus,
    executorJobId,
    created,
    updated,
    id
  ) <> (
    jobInstanceTuple =>
      JobInstance.apply(
        jobName = jobInstanceTuple._1,
        jobDefinitionId = jobInstanceTuple._2,
        sensorEventId = jobInstanceTuple._3,
        jobType = jobInstanceTuple._4,
        jobParameters = JobParameters(
          variables = jobInstanceTuple._5,
          maps = jobInstanceTuple._6
        ),
        jobStatus = jobInstanceTuple._7,
        executorJobId = jobInstanceTuple._8,
        created = jobInstanceTuple._9,
        updated = jobInstanceTuple._10,
        id = jobInstanceTuple._11
      ),
    (jobInstance: JobInstance) =>
      Option(
        jobInstance.jobName,
        jobInstance.jobDefinitionId,
        jobInstance.sensorEventId,
        jobInstance.jobType,
        jobInstance.jobParameters.variables,
        jobInstance.jobParameters.maps,
        jobInstance.jobStatus,
        jobInstance.executorJobId,
        jobInstance.created,
        jobInstance.updated,
        jobInstance.id
      )
  )

}