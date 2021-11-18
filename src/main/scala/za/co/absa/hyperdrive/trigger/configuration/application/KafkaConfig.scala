
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

package za.co.absa.hyperdrive.trigger.configuration.application

import org.springframework.boot.context.properties.bind.{DefaultValue, Name}
import org.springframework.boot.context.properties.{ConfigurationProperties, ConstructorBinding}
import org.springframework.validation.annotation.Validated

import java.util.Properties
import javax.validation.constraints.{NotBlank, NotNull}
import scala.annotation.meta.field

@ConfigurationProperties("kafka-source")
@ConstructorBinding
@Validated
class KafkaConfig (
  @(KafkaSensorProperties @field)(message = "key.deserializer, value.deserializer or max.poll.records is not defined")
  val properties: Properties,
  @Name("group.id.prefix")
  @(NotBlank @field)
  val groupIdPrefix: String,
  @Name("poll.duration")
  @NotNull
  val pollDuration: Long,
  @DefaultValue(Array("120000"))
  @Name("connectionTimeoutMillis")
  val connectionTimeoutMillis: Int = 120000
)
