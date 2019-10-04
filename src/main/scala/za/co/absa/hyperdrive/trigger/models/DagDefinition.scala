package za.co.absa.hyperdrive.trigger.models

import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses

case class DagDefinition(
  workflowId: Long,
  id: Long = 0
)

case class DagDefinitionJoined(
  workflowId: Long,
  jobDefinitions: Seq[JobDefinition],
  id: Long = 0
){
  def toDagInstanceJoined(): DagInstanceJoined = {
    DagInstanceJoined(
      status = DagInstanceStatuses.InQueue,
      workflowId = this.workflowId,
      jobInstances = jobDefinitions.map(_.toJobInstance())
    )
  }

  def toDag(): DagDefinition = {
    DagDefinition(
      workflowId = this.workflowId,
      id = this.id
    )
  }
}

object DagDefinitionJoined {
  def apply(
    dagDefinition: DagDefinition,
    jobDefinitions: Seq[JobDefinition]
  ): DagDefinitionJoined = {
    DagDefinitionJoined(
      workflowId = dagDefinition.workflowId,
      jobDefinitions = jobDefinitions,
      id = dagDefinition.id
    )
  }
}