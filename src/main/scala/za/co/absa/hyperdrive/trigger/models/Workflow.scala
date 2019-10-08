package za.co.absa.hyperdrive.trigger.models

import java.time.LocalDateTime

case class Workflow(
  name: String,
  isActive: Boolean,
  project: String,
  created: LocalDateTime,
  updated: Option[LocalDateTime],
  id: Long = 0
)

case class WorkflowState(
  isActive: Boolean
)

case class WorkflowJoined(
  name: String,
  isActive: Boolean,
  project: String,
  created: LocalDateTime,
  updated: Option[LocalDateTime],
  sensor: Sensor,
  dagDefinitionJoined: DagDefinitionJoined,
  id: Long = 0
){
  def toWorkflow: Workflow = {
    Workflow(
      name = this.name,
      isActive = this.isActive,
      project = this.project,
      created = this.created,
      updated = this.updated,
      id = this.id
    )
  }
}