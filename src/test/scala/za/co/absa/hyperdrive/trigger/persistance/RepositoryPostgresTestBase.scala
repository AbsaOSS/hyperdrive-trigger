
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

import org.scalatest.{BeforeAndAfterAll, BeforeAndAfterEach, Suite}
import org.testcontainers.containers.PostgreSQLContainer
import slick.jdbc.PostgresProfile

trait RepositoryPostgresTestBase extends Suite with RepositoryTestBase with BeforeAndAfterAll with BeforeAndAfterEach {
  override val profile = PostgresProfile

  override def beforeAll: Unit = {
    val postgresVersion = "12.7"
    val defaultDatabaseName = "test"
    val defaultUser = "test"
    val defaultPassword = "test"
    System.setProperty("db.driver", "org.testcontainers.jdbc.ContainerDatabaseDriver")
    System.setProperty("db.url", s"jdbc:tc:postgresql:${postgresVersion}:///${defaultDatabaseName}")
    System.setProperty("db.user", defaultUser)
    System.setProperty("db.password", defaultPassword)

    new PostgreSQLContainer(s"postgres:${postgresVersion}")

    h2SchemaSetup()
  }

  override def afterAll: Unit = {
    h2SchemaDrop()
  }

  override def afterEach: Unit = {
    clearData()
  }

}