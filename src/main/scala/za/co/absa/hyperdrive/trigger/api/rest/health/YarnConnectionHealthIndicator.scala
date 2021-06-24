
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

import org.springframework.boot.actuate.health.{Health, HealthIndicator}
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.scheduler.utilities.{HealthConfig, SparkExecutorConfig}

import java.net.{HttpURLConnection, MalformedURLException, URL}
import scala.util.{Failure, Success, Try}

@Component
class YarnConnectionHealthIndicator extends HealthIndicator {
  val successCode = 200

  override protected def health(): Health = {
    val yarnBaseUrl = SparkExecutorConfig.getHadoopResourceManagerUrlBase.stripSuffix("/")
    val yarnTestEndpoint = HealthConfig.yarnConnectionTestEndpoint.stripPrefix("/")

    Try(new URL(s"$yarnBaseUrl/$yarnTestEndpoint")).flatMap(url =>
      Try({
        val connection = url.openConnection().asInstanceOf[HttpURLConnection]
        HealthConfig.yarnConnectionTimeoutMillisOpt.foreach(connection.setConnectTimeout)
        connection.getResponseCode == successCode
      })
    ) match {
      case Success(healthy) => if (healthy) {
        Health.up.build()
      } else {
        Health.down().build()
      }
      case Failure(ex: MalformedURLException) => Health.unknown().withException(ex).build()
      case Failure(ex) => Health.down().withException(ex).build()
    }
  }
}
