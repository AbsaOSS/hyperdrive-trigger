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

package za.co.absa.hyperdrive.trigger.api.rest.health

import com.typesafe.scalalogging.Logger
import org.springframework.boot.actuate.health.{Health, HealthIndicator}
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.configuration.application.HealthConfig
import za.co.absa.hyperdrive.trigger.persistance.{DatabaseProvider, Repository}

import java.util.concurrent.TimeUnit
import javax.inject.Inject
import scala.concurrent.Await
import scala.concurrent.duration.Duration
import scala.util.{Failure, Success, Try}

@Component
class DatabaseConnectionHealthIndicator @Inject() (val dbProvider: DatabaseProvider, healthConfig: HealthConfig)
    extends HealthIndicator
    with Repository {
  import api._
  private val log = Logger(this.getClass)
  val dbConnection: Duration = Duration(healthConfig.databaseConnectionTimeoutMillis, TimeUnit.MILLISECONDS)
  override protected def health(): Health =
    Try {
      Await.result(db.run(sql"""SELECT 1""".as[Int]), dbConnection)
    } match {
      case Success(_) =>
        Health.up().build()
      case Failure(e) =>
        log.error("Database connection is down", e)
        Health.down().withException(e).build()
    }
}
