package za.co.absa.hyperdrive.trigger.api.rest.client

import org.slf4j.LoggerFactory
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.web.client.RestTemplate

import scala.annotation.tailrec
import scala.reflect.ClassTag

class RestClient(authClient: AuthClient, restTemplate: RestTemplate) {
  private val logger = LoggerFactory.getLogger(this.getClass)

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
  private def send[B, T](method: HttpMethod, url: String, headers: HttpHeaders, body: Option[B], retriesLeft: Int = 1)(
    implicit ct: ClassTag[T]
  ): T = {
    logger.info(s"$method - URL: $url")

    headers.putAll(authHeaders)

    val httpEntity = body.fold(new HttpEntity[String](headers)) { b =>
      val requestBody = JsonSerializer.toJson(b)
      logger.info(s"Request Body: $requestBody")
      new HttpEntity[String](requestBody, headers)
    }

    val response   = restTemplate.exchange(url, method, httpEntity, classOf[String])
    val statusCode = response.getStatusCode

    statusCode match {
      case HttpStatus.OK | HttpStatus.CREATED => {
        logger.info(s"Response - $statusCode : ${response.getBody}")
        JsonSerializer.fromJson[T](response.getBody)
      }
      case HttpStatus.UNAUTHORIZED | HttpStatus.FORBIDDEN => {
        logger.warn(s"Response - $statusCode :${Option(response.getBody).getOrElse("None")}")
        logger.warn(s"Unauthorized $method request for URL: $url")
        if (retriesLeft <= 0) {
          throw UnauthorizedException("Unable to reauthenticate, no retries left")
        }

        logger.warn("Expired session, reaunthenticating")
        authenticate()

        logger.info(s"Retrying $method request for URL: $url")
        logger.info(s"Retries left: $retriesLeft")
        send[B, T](method, url, headers, body, retriesLeft - 1)
      }
      case HttpStatus.NOT_FOUND =>
        throw NotFoundException(s"Entity not found - $statusCode")
      case _ =>
        throw ApiClientException(s"Response - $statusCode : ${Option(response.getBody).getOrElse("None")}")
    }

  }
}
