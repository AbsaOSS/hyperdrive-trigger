package za.co.absa.hyperdrive.trigger.models.enums

object JobTypes {

  sealed abstract class JobType(val name: String) {
    override def toString: String = name
  }

  case object Spark extends JobType("Spark")

  val jobTypes: Set[JobType] = Set(Spark)

}