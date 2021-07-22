
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

import javax.validation.constraints.NotBlank
import scala.annotation.meta.field

@ConfigurationProperties
@ConstructorBinding
@Validated
class GeneralConfig (
  @Name("application.maximumNumberOfWorkflowsInBulkRun")
  @DefaultValue(Array("10"))
  val maximumNumberOfWorkflowsInBulkRun: Int,
  @DefaultValue(Array("Unknown"))
  val environment: String,
  @DefaultValue(Array("Unknown"))
  val version: String,
  @(NotBlank @field)
  val appUniqueId: String,
  @Name("spark.cluster.api")
  val sparkClusterApi: String
)
