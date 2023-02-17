package za.co.absa.hyperdrive.trigger.models

import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType

case class IngestionStatus(
  name: String,
  project: String,
  jobIngestionStatus: Seq[JobIngestionStatus],
  id: Long = 0
)

case class JobIngestionStatus(
  jobName: String,
  jobType: JobType,
  topic: String,
  messagesToIngest: Option[Map[Int, Long]]
)
