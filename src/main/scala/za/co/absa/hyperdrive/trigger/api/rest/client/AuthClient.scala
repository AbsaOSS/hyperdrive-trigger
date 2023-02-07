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
import org.springframework.http.{HttpEntity, HttpHeaders, HttpMethod, HttpStatus, ResponseEntity}
import org.springframework.security.kerberos.client.KerberosRestTemplate
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.client.RestTemplate

import scala.collection.JavaConverters._
import scala.util.Try

object AuthClient {

  def apply(credentials: Credentials, apiCaller: ApiCaller, authEndpoint: String): AuthClient =
    credentials match {
      case standardCredentials: StandardCredentials =>
        createStandardAuthClient(apiCaller, standardCredentials, authEndpoint)
      case standardCredentialsBase64: StandardCredentialsBase64 =>
        createStandardBase64AuthClient(apiCaller, standardCredentialsBase64, authEndpoint)
      case kerberosCredentials: KerberosCredentials =>
        createSpnegoAuthClient(apiCaller, kerberosCredentials, authEndpoint)
    }

  private def createStandardAuthClient(
    apiCaller: ApiCaller,
    credentials: StandardCredentials,
    path: String
  ): StandardAuthClient = {
    val restTemplate = RestTemplateSingleton.instance
    new StandardAuthClient(credentials, restTemplate, apiCaller, path)
  }

  private def createStandardBase64AuthClient(
    apiCaller: ApiCaller,
    credentials: StandardCredentialsBase64,
    path: String
  ): StandardBase64AuthClient = {
    val restTemplate = RestTemplateSingleton.instance
    new StandardBase64AuthClient(credentials, restTemplate, apiCaller, path)
  }

  private def createSpnegoAuthClient(
    apiCaller: ApiCaller,
    credentials: KerberosCredentials,
    path: String
  ): SpnegoAuthClient = {
    val restTemplate = new KerberosRestTemplate(credentials.keytabLocation, credentials.username)
    restTemplate.setErrorHandler(NoOpErrorHandler)
    new SpnegoAuthClient(credentials, restTemplate, apiCaller, path)
  }
}

sealed abstract class AuthClient(
  credentials: Credentials,
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
          logger.info(s"Authentication successful")
          getAuthHeaders(response)
        case _ =>
          throw UnauthorizedException(s"Authentication failure ($statusCode)")
      }
    }

  protected def requestAuthentication(url: String): ResponseEntity[String]

  private def getAuthHeaders(response: ResponseEntity[String]): HttpHeaders = {
    val headers       = response.getHeaders
    val sessionCookie = headers.get("set-cookie").asScala.head
    val csrfToken     = Try(headers.get("X-CSRF-TOKEN").asScala.head).toOption

    val resultHeaders = new HttpHeaders()

    logger.debug(s"Session Cookie: $sessionCookie")
    resultHeaders.add("cookie", sessionCookie)

    csrfToken match {
      case Some(ct) =>
        logger.debug(s"CSRF Token: $ct")
        resultHeaders.add("X-CSRF-TOKEN", ct)
      case None =>
        logger.debug(s"CSRF Token not found")
    }

    resultHeaders
  }
}

class SpnegoAuthClient(
  credentials: KerberosCredentials,
  restTemplate: RestTemplate,
  apiCaller: ApiCaller,
  path: String
) extends AuthClient(credentials, restTemplate, apiCaller, baseUrl => s"$baseUrl$path") {
  override protected def requestAuthentication(url: String): ResponseEntity[String] = {
    logger.info(s"Authenticating via SPNEGO ($url): user `${credentials.username}`, with keytab `${credentials.keytabLocation}`")
    restTemplate.getForEntity(url, classOf[String])
  }
}

class StandardAuthClient(
  credentials: StandardCredentials,
  restTemplate: RestTemplate,
  apiCaller: ApiCaller,
  path: String
) extends AuthClient(credentials, restTemplate, apiCaller, baseUrl => s"$baseUrl$path") {
  override protected def requestAuthentication(url: String): ResponseEntity[String] = {
    val requestParts = new LinkedMultiValueMap[String, String]
    requestParts.add("username", credentials.username)
    requestParts.add("password", credentials.password)

    logger.info(s"Authenticating via username and password ($url): user `${credentials.username}`")
    restTemplate.postForEntity(url, requestParts, classOf[String])
  }
}

class StandardBase64AuthClient(
  credentials: StandardCredentialsBase64,
  restTemplate: RestTemplate,
  apiCaller: ApiCaller,
  path: String
) extends AuthClient(credentials, restTemplate, apiCaller, baseUrl => s"$baseUrl$path") {
  override protected def requestAuthentication(url: String): ResponseEntity[String] = {
    val headers = new HttpHeaders()
    headers.add("Authorization", "Basic " + credentials.base64Credentials)
    val requestEntity = new HttpEntity(null, headers)
    restTemplate.exchange(url, HttpMethod.GET, requestEntity, classOf[String])
  }
}
