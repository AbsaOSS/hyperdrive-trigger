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

package za.co.absa.hyperdrive.trigger.api.rest.services.clients

import com.fasterxml.jackson.databind.module.SimpleModule
import org.springframework.context.annotation.{Bean, Configuration}
import za.co.absa.hyperdrive.trigger.api.rest.client._
import za.co.absa.hyperdrive.trigger.configuration.application.ConfluentConfig
import za.co.absa.hyperdrive.trigger.models.confluent.RoleBinding
import za.co.absa.hyperdrive.trigger.scheduler.sensors.kafka.ItemDeserializer

import javax.inject.Inject

@Configuration
class ConfluentClientFactory @Inject() (confluentConfig: ConfluentConfig) {
  private val baseUrls: Seq[String] = confluentConfig.baseUrls
  private val authPath: String = confluentConfig.authPath
  private val base64Credentials: String = confluentConfig.base64Credentials
  private val retries: Int = confluentConfig.retries
  private val credentials: Credentials = StandardCredentialsBase64(base64Credentials)

  @Bean
  def confluentClient(): ConfluentClient = getInstance(credentials, baseUrls, retries)

  private def getInstance(
    credentials: Credentials,
    apiBaseUrls: Seq[String],
    urlsRetryCount: Int
  ): ConfluentClient = {
    registerRoleModule()
    val apiCaller = CrossHostApiCaller(apiBaseUrls, urlsRetryCount)
    val authClient = AuthClient(credentials, apiCaller, authPath)
    val restClient = new RestClient(authClient, RestTemplateSingleton.instance)
    new ConfluentClient(apiCaller, restClient)
  }

  private def registerRoleModule(): Unit = {
    val rolesModule = new SimpleModule()
    rolesModule.addDeserializer(classOf[Seq[RoleBinding]], new ItemDeserializer)
    JsonSerializer.objectMapper.registerModule(rolesModule)

  }
}
