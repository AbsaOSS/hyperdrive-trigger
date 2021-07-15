
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

package za.co.absa.hyperdrive.trigger.persistance

import org.scalatest.{BeforeAndAfterAll, Suite}
import org.testcontainers.containers.PostgreSQLContainer
import slick.jdbc.PostgresProfile
import za.co.absa.hyperdrive.trigger.configuration.application.DatabaseConfig

import java.util.UUID

trait RepositoryPostgresTestBase extends RepositoryTestBase with BeforeAndAfterAll { this: Suite =>
  private val databaseName = UUID.randomUUID().toString
  private val postgresVersion = "12.7"
  private val defaultUser = "test"
  private val defaultPass = "test"
  val databaseConfig: DatabaseConfig = {
    DatabaseConfig(Map(
      "driver" -> "org.testcontainers.jdbc.ContainerDatabaseDriver",
      "url" -> s"jdbc:tc:postgresql:${postgresVersion}:///${databaseName}",
      "user" -> defaultUser,
      "password" -> defaultPass
    ))
  }
  override val profile = PostgresProfile
  override val dbProvider: DatabaseProvider = new DatabaseProvider(databaseConfig)
  override def beforeAll(): Unit = {
    new PostgreSQLContainer(s"postgres:${postgresVersion}")
      .withDatabaseName(databaseName)

    super.beforeAll()
  }
}

