
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

import javax.validation.Valid
import javax.validation.constraints.NotNull

@ConfigurationProperties("health")
@ConstructorBinding
@Validated
class HealthConfig (
  @Valid
  @Name("databaseConnection")
  databaseConnectionInternal: DatabaseConnection,
  @Valid
  @NotNull
  val yarnConnection: YarnConnection
) {
  val databaseConnection: DatabaseConnection = Option(databaseConnectionInternal).getOrElse(new DatabaseConnection())
}

class DatabaseConnection (
  @DefaultValue(Array("120000"))
  val timeoutMillis: Int = 120000
)

class YarnConnection (
  @NotNull
  val testEndpoint: String,
  @Name("timeoutMillis")
  // TODO: Cannot be null!
  timeoutMillisInternal: Int
) {
  val timeoutMillis: Option[Int] = Option(timeoutMillisInternal)
}
