package za.co.absa.hyperdrive.trigger.api.rest.client

import org.springframework.beans.factory.FactoryBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import za.co.absa.hyperdrive.trigger.configuration.application.MenasConfig

import javax.inject.Inject

@Configuration
class MenasClientFactory @Inject() (menasConfig: MenasConfig) {

  private val username: Option[String] = validateStringParam(menasConfig.username)
  private val password: Option[String] = validateStringParam(menasConfig.password)
  private val keytab: Option[String]   = validateStringParam(menasConfig.keytab)
  private val baseUrls: Seq[String]    = validateArrayParam("menas.baseUrls", menasConfig.baseUrls).toSeq
  private val ldapPath: String         = menasConfig.ldapPath
  private val spnegoPath: String       = menasConfig.spnegoPath
  private val retries: Option[Int]     = menasConfig.retries

  private val credentials: Credentials = (username, password, keytab) match {
    case (Some(user), _, Some(keytab)) => KerberosCredentials(user, keytab)
    case (Some(user), Some(pwd), _)    => LdapCredentials(user, pwd)
    case _                             => InvalidCredentials
  }

  private val authEndpoints: AuthEndpoints = AuthEndpoints(ldapPath, spnegoPath)

  @Bean
  def menasClient(): MenasClient = getInstance(credentials, baseUrls, retries)

  private def getInstance(
    credentials: Credentials,
    apiBaseUrls: Seq[String],
    urlsRetryCount: Option[Int] = None
  ): MenasClient = {
    val apiCaller  = CrossHostApiCaller(apiBaseUrls, urlsRetryCount.getOrElse(CrossHostApiCaller.DefaultUrlsRetryCount))
    val authClient = AuthClient(credentials, apiCaller, authEndpoints)
    val restClient = new RestClient(authClient, RestTemplateSingleton.instance)
    new MenasClient(apiCaller, restClient)
  }

  private def validateStringParam(str: String): Option[String] = if (str.trim == "") None else Some(str)
  private def validateArrayParam[T](name: String, value: Array[T]): Array[T] =
    if (value.isEmpty) throw new IllegalArgumentException(s"Parameter $name was not defined") else value

}
