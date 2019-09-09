package za.co.absa.hyperdrive.trigger.models

case class JobParameters(
  variables: Map[String, String],
  maps: Map[String, Set[String]]
)