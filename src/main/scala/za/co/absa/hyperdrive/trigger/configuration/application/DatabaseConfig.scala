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

import com.typesafe.config.{Config, ConfigFactory}
import org.springframework.boot.context.properties.bind.{DefaultValue, Name}
import org.springframework.boot.context.properties.{ConfigurationProperties, ConstructorBinding}
import org.springframework.validation.annotation.Validated

import java.util.Properties
import javax.validation.constraints.NotNull

@ConfigurationProperties
@ConstructorBinding
@Validated
class DatabaseConfig(
  @Name("db")
  @NotNull
  val dbProperties: Properties,
  @Name("db.skip.liquibase")
  @DefaultValue(Array("false"))
  val skipLiquibase: Boolean
) {
  val dbConfig: Config = ConfigFactory.parseProperties(dbProperties)
}
