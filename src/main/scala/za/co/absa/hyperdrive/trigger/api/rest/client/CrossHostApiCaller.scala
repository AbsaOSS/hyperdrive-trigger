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

import com.typesafe.scalalogging.Logger
import org.apache.commons.lang3.exception.ExceptionUtils
import org.springframework.web.client
import org.springframework.web.client.ResourceAccessException

import scala.annotation.tailrec
import scala.util.{Failure, Random, Try}

class CrossHostApiCaller private (apiBaseUrls: Vector[String], maxTryCount: Int, private var currentHostIndex: Int)
    extends ApiCaller {
  import CrossHostApiCaller._
  def baseUrlsCount: Int = apiBaseUrls.size

  def currentBaseUrl: String = apiBaseUrls(currentHostIndex)

  def nextBaseUrl(): String = {
    currentHostIndex = (currentHostIndex + 1) % baseUrlsCount
    currentBaseUrl
  }

  override def call[T](fn: String => T): T = {
    def logFailure(error: Throwable, url: String, attemptNumber: Int, nextUrl: Option[String]): Unit = {
      val rootCause = ExceptionUtils.getRootCauseMessage(error)
      val switching = nextUrl.map(s => s", switching host to $s").getOrElse("")
      logger.warn(s"Request failed on host $url (attempt $attemptNumber of $maxTryCount)$switching - $rootCause")
    }

    @tailrec
    def attempt(url: String, attemptNumber: Int, urlsTried: Int): Try[T] = {
      val result = Try {
        fn(url)
      }.recoverWith { case e @ (_: ResourceAccessException | _: client.RestClientException) =>
        Failure(ApiClientException("Server non-responsive", e))
      }
      // using match instead of recoverWith to make the function @tailrec
      result match {
        case Failure(e: RetryableException) if attemptNumber < maxTryCount =>
          logFailure(e, url, attemptNumber, None)
          attempt(url, attemptNumber + 1, urlsTried)
        case Failure(e: RetryableException) if urlsTried < baseUrlsCount =>
          val nextUrl = nextBaseUrl()
          logFailure(e, url, attemptNumber, Option(nextUrl))
          attempt(nextUrl, 1, urlsTried + 1)
        case _ => result
      }
    }

    attempt(currentBaseUrl, 1, 1).get
  }
}

object CrossHostApiCaller {
  private val logger = Logger[CrossHostApiCaller]

  final val DefaultUrlsRetryCount: Int = 0

  private def createInstance(
    apiBaseUrls: Seq[String],
    urlsRetryCount: Int,
    startWith: Option[Int]
  ): CrossHostApiCaller = {
    val maxTryCount: Int = (
      if (urlsRetryCount < 0) {
        logger.warn(
          s"Urls retry count cannot be negative ($urlsRetryCount). Using default number of retries instead ($DefaultUrlsRetryCount)."
        ) // scalastyle:ignore maxLineLength
        DefaultUrlsRetryCount
      } else {
        urlsRetryCount
      }
    ) + 1
    val currentHostIndex = startWith.getOrElse(Random.nextInt(Math.max(apiBaseUrls.size, 1)))
    new CrossHostApiCaller(apiBaseUrls.toVector, maxTryCount, currentHostIndex)
  }

  def apply(
    apiBaseUrls: Seq[String],
    urlsRetryCount: Int = DefaultUrlsRetryCount,
    startWith: Option[Int] = None
  ): CrossHostApiCaller =
    createInstance(apiBaseUrls, urlsRetryCount, startWith)
}
