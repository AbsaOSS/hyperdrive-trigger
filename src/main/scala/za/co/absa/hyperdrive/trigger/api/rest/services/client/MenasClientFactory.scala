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

package za.co.absa.hyperdrive.trigger.api.rest.services.client

import org.slf4j.{Logger, LoggerFactory}
import org.springframework.context.annotation.{Bean, Configuration}
import za.co.absa.hyperdrive.trigger.api.rest.client._
import za.co.absa.hyperdrive.trigger.configuration.application.MenasConfig

import javax.inject.Inject

@Configuration
class MenasClientFactory @Inject() (menasConfig: MenasConfig) {
  protected val logger: Logger = LoggerFactory.getLogger(this.getClass)

  private val authMechanism: String    = menasConfig.authMechanism
  private val username: Option[String] = validateStringParam(menasConfig.username)
  private val password: Option[String] = validateStringParam(menasConfig.password)
  private val keytab: Option[String]   = validateStringParam(menasConfig.keytab)
  private val baseUrls: Seq[String]    = validateArrayParam("menas.baseUrls", menasConfig.baseUrls).toSeq
  private val standardPath: String     = menasConfig.standardAuthPath
  private val spnegoPath: String       = menasConfig.spnegoAuthPath
  private val retries: Option[Int]     = menasConfig.retries

  private val credentials: Credentials = (authMechanism.toLowerCase match {
    case "standard" => {
      logger.info(s"Using username and password to log into Menas")
      for {
        user <- username
        pwd  <- password
      } yield StandardCredentials(user, pwd)
    }
    case "spnego" => {
      logger.info(s"Using keytab to log into Menas")
      for {
        user <- username
        kt   <- keytab
      } yield KerberosCredentials(user, kt)
    }
    case str => {
      logger.error(s"Invalid Menas authentication method: `$str` ")
      Some(InvalidCredentials)
    }
  }).getOrElse {
    logger.error(s"Invalid credentials for Menas authentication method `$authMechanism`")
    InvalidCredentials
  }

  private val authEndpoints: AuthEndpoints = AuthEndpoints(standardPath, spnegoPath)

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
