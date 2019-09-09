package za.co.absa.hyperdrive.trigger.models

import java.time.LocalDateTime

import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.JobStatus
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType

case class JobInstance(
  jobName: String,
  jobDefinitionId: Long,
  eventId: String,
  jobType: JobType,
  jobParameters: JobParameters,
  jobStatus: JobStatus,
  executorJobId: Option[String],
  created: LocalDateTime,
  updated: Option[LocalDateTime],
  id: Long = 0
)


case class JobInstanceJoined(
  jobName: String,
  jobDefinition: JobDefinition,
  event: Event,
  jobType: JobType,
  jobParameters: JobParameters,
  jobStatus: JobStatus,
  executorJobId: Option[String],
  created: LocalDateTime,
  updated: Option[LocalDateTime],
  id: Long = 0
)