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

import com.typesafe.scalalogging.LazyLogging
import org.springframework.http.{HttpEntity, HttpHeaders, HttpMethod, HttpStatus}
import org.springframework.web.client.RestTemplate

import scala.annotation.tailrec
import scala.reflect.ClassTag

class RestClient(authClient: AuthClient, restTemplate: RestTemplate) extends LazyLogging {

  private var authHeaders = new HttpHeaders()

  def authenticate(): Unit =
    authHeaders = authClient.authenticate()

  @throws[ApiClientException]
  @throws[NotFoundException]
  @throws[UnauthorizedException]
  def sendGet[T](url: String)(implicit ct: ClassTag[T]): T =
    send[T, T](HttpMethod.GET, url, new HttpHeaders(), None)

  @throws[ApiClientException]
  @throws[NotFoundException]
  @throws[UnauthorizedException]
  def sendPost[B, T](url: String, requestBody: B)(implicit ct: ClassTag[T]): T = {
    val headers = new HttpHeaders()
    headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=utf-8")
    send[B, T](HttpMethod.POST, url, headers, Option(requestBody))
  }

  @tailrec
  private def send[B, T](
    method: HttpMethod,
    url: String,
    headers: HttpHeaders,
    body: Option[B],
    authRetriesLeft: Int = 1
  )(
    implicit ct: ClassTag[T]
  ): T = {
    logger.info(s"$method - URL: $url")

    headers.putAll(authHeaders)

    val httpEntity = body.fold(new HttpEntity[String](headers)) { b =>
      val requestBody = RestClientSerde.toJson(b)
      logger.info(s"Request Body: $requestBody")
      new HttpEntity[String](requestBody, headers)
    }

    val response = restTemplate.exchange(url, method, httpEntity, classOf[String])
    val statusCode = response.getStatusCode

    statusCode match {
      case HttpStatus.OK | HttpStatus.CREATED =>
        logger.info(s"Response - $statusCode")
        RestClientSerde.fromJson[T](response.getBody)
      case HttpStatus.UNAUTHORIZED | HttpStatus.FORBIDDEN =>
        logger.warn(s"Response - $statusCode :${Option(response.getBody).getOrElse("None")}")
        logger.warn(s"Unauthorized $method request for URL: $url")
        if (authRetriesLeft <= 0) {
          throw UnauthorizedException("Unable to reauthenticate, no retries left")
        }

        logger.warn("Expired session, reauthenticating")
        authenticate()

        logger.info(s"Retrying $method request for URL: $url")
        logger.info(s"Retries left: $authRetriesLeft")
        send[B, T](method, url, headers, body, authRetriesLeft - 1)
      case HttpStatus.NOT_FOUND =>
        throw NotFoundException(s"Entity not found - $statusCode")
      case _ =>
        throw ApiClientException(s"Response - $statusCode : ${Option(response.getBody).getOrElse("None")}")
    }

  }
}
