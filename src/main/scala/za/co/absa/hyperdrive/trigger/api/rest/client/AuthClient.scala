/*
 * Copyright 2018 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package za.co.absa.hyperdrive.trigger.api.rest.client

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.kerberos.client.KerberosRestTemplate
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.client.RestTemplate

import scala.collection.JavaConverters._

object AuthClient {

  def apply(credentials: Credentials, apiCaller: ApiCaller, authEndpoints: AuthEndpoints): AuthClient = credentials match {
    case ldapCredentials: LdapCredentials         => createLdapAuthClient(apiCaller, ldapCredentials, authEndpoints.ldapPath)
    case kerberosCredentials: KerberosCredentials => createSpnegoAuthClient(apiCaller, kerberosCredentials, authEndpoints.spnegoPath)
    case InvalidCredentials                       => throw UnauthorizedException("No valid credentials provided")
  }

  private def createLdapAuthClient(apiCaller: ApiCaller, credentials: LdapCredentials, path: String): LdapAuthClient = {
    val restTemplate = RestTemplateSingleton.instance
    new LdapAuthClient(credentials.username, credentials.password, restTemplate, apiCaller, path)
  }

  private def createSpnegoAuthClient(apiCaller: ApiCaller, credentials: KerberosCredentials, path: String): SpnegoAuthClient = {
    val restTemplate = new KerberosRestTemplate(credentials.keytabLocation, credentials.username)
    restTemplate.setErrorHandler(NoOpErrorHandler)
    new SpnegoAuthClient(credentials.username, credentials.keytabLocation, restTemplate, apiCaller, path)
  }
}

sealed abstract class AuthClient(
  username: String,
  restTemplate: RestTemplate,
  apiCaller: ApiCaller,
  url: String => String
) {
  protected val logger: Logger = LoggerFactory.getLogger(this.getClass)

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

class SpnegoAuthClient(username: String, keytabLocation: String, restTemplate: RestTemplate, apiCaller: ApiCaller, path: String)
    extends AuthClient(username, restTemplate, apiCaller, baseUrl => s"$baseUrl$path") {
  override protected def requestAuthentication(url: String): ResponseEntity[String] = {
    logger.info(s"Authenticating via SPNEGO ($url): user `$username`, with keytab `$keytabLocation`")
    restTemplate.getForEntity(url, classOf[String])
  }
}

class LdapAuthClient(username: String, password: String, restTemplate: RestTemplate, apiCaller: ApiCaller, path: String)
    extends AuthClient(username, restTemplate, apiCaller, baseUrl => s"$baseUrl$path") {
  override protected def requestAuthentication(url: String): ResponseEntity[String] = {
    val requestParts = new LinkedMultiValueMap[String, String]
    requestParts.add("username", username)
    requestParts.add("password", password)

    logger.info(s"Authenticating via LDAP ($url): user `$username`")
    restTemplate.postForEntity(url, requestParts, classOf[String])
  }
}
