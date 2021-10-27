package za.co.absa.hyperdrive.trigger.api.rest.client

sealed abstract class Credentials {
  val username: String
}

case class LdapCredentials(username: String, password: String)           extends Credentials
case class KerberosCredentials(username: String, keytabLocation: String) extends Credentials
case object InvalidCredentials extends Credentials {
  override val username = "invalid-credentials"
}
