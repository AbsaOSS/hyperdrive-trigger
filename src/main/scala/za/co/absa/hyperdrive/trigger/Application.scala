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

package za.co.absa.hyperdrive.trigger

import com.fasterxml.jackson.databind._
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.context.annotation.{Bean, Configuration}
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import za.co.absa.hyperdrive.trigger.api.rest.ObjectMapperSingleton
import za.co.absa.hyperdrive.trigger.configuration.application.NotNullValidationBindHandlerAdvisor

@SpringBootApplication
@EnableAsync
@Configuration
@ConfigurationPropertiesScan(Array("za.co.absa.hyperdrive.trigger.configuration"))
class Application() {
  @Bean def asyncExecutor(): ThreadPoolTaskExecutor = {
    val executor = new ThreadPoolTaskExecutor()
    executor.setCorePoolSize(12)
    executor.setMaxPoolSize(24)
    executor.setQueueCapacity(1024)
    executor.initialize()
    executor
  }

  @Bean
  def objectMapper(): ObjectMapper = ObjectMapperSingleton.getObjectMapper

  @Bean
  def notNullValidationBindHandlerAdvisor(): NotNullValidationBindHandlerAdvisor =
    new NotNullValidationBindHandlerAdvisor()

}
