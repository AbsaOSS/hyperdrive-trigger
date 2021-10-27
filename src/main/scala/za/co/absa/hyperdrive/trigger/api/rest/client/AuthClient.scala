package za.co.absa.hyperdrive.trigger.api.rest.client

import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.kerberos.client.KerberosRestTemplate
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.client.RestTemplate

import scala.collection.JavaConverters._

object AuthClient {

  def apply(credentials: Credentials, apiCaller: ApiCaller): AuthClient = credentials match {
    case ldapCredentials: LdapCredentials         => createLdapAuthClient(apiCaller, ldapCredentials)
    case kerberosCredentials: KerberosCredentials => createSpnegoAuthClient(apiCaller, kerberosCredentials)
    case InvalidCredentials                       => throw UnauthorizedException("No valid credetials provided")
  }

  private def createLdapAuthClient(apiCaller: ApiCaller, credentials: LdapCredentials): LdapAuthClient = {
    val restTemplate = RestTemplateSingleton.instance
    new LdapAuthClient(credentials.username, credentials.password, restTemplate, apiCaller)
  }

  private def createSpnegoAuthClient(apiCaller: ApiCaller, credentials: KerberosCredentials): SpnegoAuthClient = {
    val restTemplate = new KerberosRestTemplate(credentials.keytabLocation, credentials.username)
    restTemplate.setErrorHandler(NoOpErrorHandler)
    new SpnegoAuthClient(credentials.username, credentials.keytabLocation, restTemplate, apiCaller)
  }
}

sealed abstract class AuthClient(
  username: String,
  restTemplate: RestTemplate,
  apiCaller: ApiCaller,
  url: String => String
) {
  protected val logger = LoggerFactory.getLogger(this.getClass)

  @throws[UnauthorizedException]
  def authenticate(): HttpHeaders =
    apiCaller.call { baseUrl =>
      val response   = requestAuthentication(url(baseUrl))
      val statusCode = response.getStatusCode

      statusCode match {
        case HttpStatus.OK =>
          logger.info(s"Authentication successful: $username")
          getAuthHeaders(response)
        case _ =>
          throw UnauthorizedException(s"Authentication failure ($statusCode): $username")
      }
    }

  protected def requestAuthentication(url: String): ResponseEntity[String]

  private def getAuthHeaders(response: ResponseEntity[String]): HttpHeaders = {
    val headers       = response.getHeaders
    val sessionCookie = headers.get("set-cookie").asScala.head
    val csrfToken     = headers.get("X-CSRF-TOKEN").asScala.head

    logger.info(s"Session Cookie: $sessionCookie")
    logger.info(s"CSRF Token: $csrfToken")

    val resultHeaders = new HttpHeaders()
    resultHeaders.add("cookie", sessionCookie)
    resultHeaders.add("X-CSRF-TOKEN", csrfToken)
    resultHeaders
  }
}

class SpnegoAuthClient(username: String, keytabLocation: String, restTemplate: RestTemplate, apiCaller: ApiCaller)
    extends AuthClient(username, restTemplate, apiCaller, baseUrl => s"$baseUrl/api/user/info") { //FIXME: fix url
  override protected def requestAuthentication(url: String): ResponseEntity[String] = {//FIXME: protected?
    logger.info(s"Authenticating via SPNEGO ($url): user `$username`, with keytab `$keytabLocation`")
    restTemplate.getForEntity(url, classOf[String])
  }
}

class LdapAuthClient(username: String, password: String, restTemplate: RestTemplate, apiCaller: ApiCaller)
    extends AuthClient(username, restTemplate, apiCaller, baseUrl => s"$baseUrl/api/login") { //FIXME: fix url
  override protected def requestAuthentication(url: String): ResponseEntity[String] = {//FIXME: protected?
    val requestParts = new LinkedMultiValueMap[String, String]
    requestParts.add("username", username)
    requestParts.add("password", password)

    logger.info(s"Authenticating via LDAP ($url): user `$username`")
    restTemplate.postForEntity(url, requestParts, classOf[String])
  }
}
