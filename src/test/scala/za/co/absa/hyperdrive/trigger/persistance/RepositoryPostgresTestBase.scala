
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

trait RepositoryPostgresTestBase extends RepositoryTestBase with BeforeAndAfterAll { this: Suite =>
  override val profile = PostgresProfile
  private val defaultDatabaseName = "test"

  override def beforeAll(): Unit = {
    val postgresVersion = "12.7"
    val defaultUser = "test"
    val defaultPass = "test"
    System.setProperty("db.driver", "org.testcontainers.jdbc.ContainerDatabaseDriver")
    System.setProperty("db.url", s"jdbc:tc:postgresql:${postgresVersion}:///${defaultDatabaseName}")
    System.setProperty("db.user", defaultUser)
    System.setProperty("db.password", defaultPass)

    new PostgreSQLContainer(s"postgres:${postgresVersion}")

    super.beforeAll()
  }
}
