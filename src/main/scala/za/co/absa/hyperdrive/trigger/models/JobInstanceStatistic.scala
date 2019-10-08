package za.co.absa.hyperdrive.trigger.models

case class OverallStatistics(
  successful: Int,
  failed: Int,
  running: Int,
  queued: Int
)

case class PerWorkflowStatistics(
  workflowId: Long,
  workflowName: String,
  isActive: Boolean,
  total: Int,
  successful: Int,
  failed: Int,
  queued: Int,
  running: Int
)

case class PerDagStatistics(
  dagId: Long,
  total: Int,
  successful: Int,
  failed: Int,
  queued: Int,
  running: Int
)

case class PerProjectStatistics(
  projectName: String,
  total: Int,
  successful: Int,
  failed: Int,
  queued: Int,
  running: Int
)