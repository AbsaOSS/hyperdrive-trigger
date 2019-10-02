package za.co.absa.hyperdrive.trigger.models

import java.time.LocalDateTime

import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.InQueue
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType

case class JobDefinition(
  dagDefinitionId: Long,
  name: String,
  jobType: JobType,
  jobParameters: JobParameters,
  order: Int,
  id: Long = 0
){
  def toJobInstance(): JobInstance = {
    JobInstance(
      jobName = this.name,
      jobType = this.jobType,
      jobParameters = this.jobParameters,
      jobStatus = InQueue,
      executorJobId = None,
      created = LocalDateTime.now(),
      updated = None,
      order = this.order,
      dagInstanceId = 0
    )
  }
}