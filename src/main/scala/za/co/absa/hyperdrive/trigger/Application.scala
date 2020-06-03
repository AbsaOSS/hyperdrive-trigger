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

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind._
import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.{Bean, ComponentScan, Configuration}
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.JobStatus
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes.SensorType
import za.co.absa.hyperdrive.trigger.models.enums.{JobStatuses, JobTypes, SensorTypes}

@SpringBootApplication
@EnableAsync
@Configuration
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
  def objectMapper(): ObjectMapper = {
    val module = new SimpleModule()
      .addDeserializer(classOf[SensorType], new SensorTypesDeserializer)
      .addDeserializer(classOf[JobStatus], new JobStatusesDeserializer)
      .addDeserializer(classOf[JobType], new JobTypesDeserializer)

    new ObjectMapper()
      .registerModule(DefaultScalaModule)
      .registerModule(new JavaTimeModule())
      .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
      .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
      .configure(DeserializationFeature.FAIL_ON_MISSING_CREATOR_PROPERTIES, false)
      .registerModule(module)
  }

  class SensorTypesDeserializer extends JsonDeserializer[SensorType] {
    override def deserialize(p: JsonParser, ctxt: DeserializationContext): SensorType = {
      val node = p.getCodec.readTree[JsonNode](p)
      val value = node.get("name").textValue()
      SensorTypes.sensorTypes.find(_.name == value).getOrElse(throw new Exception("Failed to find enum value"))
    }
  }

  class JobStatusesDeserializer extends JsonDeserializer[JobStatus] {
    override def deserialize(p: JsonParser, ctxt: DeserializationContext): JobStatus = {
      val node = p.getCodec.readTree[JsonNode](p)
      val value = node.get("name").textValue()
      JobStatuses.statuses.find(_.name == value).getOrElse(throw new Exception("Failed to find enum value"))
    }
  }

  class JobTypesDeserializer extends JsonDeserializer[JobType] {
    override def deserialize(p: JsonParser, ctxt: DeserializationContext): JobType = {
      val node = p.getCodec.readTree[JsonNode](p)
      val value = node.get("name").textValue()
      JobTypes.jobTypes.find(_.name == value).getOrElse(throw new Exception("Failed to find enum value"))
    }
  }

}

object Application extends App {
  val context = SpringApplication.run(classOf[Application], args: _*)
  context.getBean(classOf[HyperDriverManager]).startManager
}
