package za.co.absa.hyperdrive.trigger.models.enums

object DagInstanceStatuses {

  sealed abstract class DagInstanceStatus(val name: String, val isFinalStatus: Boolean, val isFailed: Boolean, val isRunning: Boolean) {
    override def toString: String = name
  }

  case object InQueue extends DagInstanceStatus("InQueue", false, false, false)
  case object Running extends DagInstanceStatus("Running", false, false, true)
  case object Succeeded extends DagInstanceStatus("Succeeded", true, false, false)
  case object Failed extends DagInstanceStatus("Failed", true, true, false)

  val statuses: Set[DagInstanceStatus] = Set(InQueue,Running,Succeeded,Failed)
  val finalStatuses: Set[DagInstanceStatus] = statuses.filter(!_.isFinalStatus)

}