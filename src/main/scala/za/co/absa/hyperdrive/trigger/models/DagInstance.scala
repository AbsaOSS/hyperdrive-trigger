package za.co.absa.hyperdrive.trigger.models

import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses.DagInstanceStatus

case class DagInstance(
  status: DagInstanceStatus,
  workflowId: Long,
  id: Long = 0
)

case class DagInstanceJoined(
  status: DagInstanceStatus,
  workflowId: Long,
  jobInstances: Seq[JobInstance],
  id: Long = 0
){
  def toDagInstance(): DagInstance = {
    DagInstance(
      status = this.status,
      workflowId = this.workflowId
    )
  }
}