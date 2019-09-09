package za.co.absa.hyperdrive.trigger.models

import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType

case class JobDefinition(
  workflowId: Long,
  name: String,
  jobType: JobType,
  jobParameters: JobParameters,
  id: Long = 0
)