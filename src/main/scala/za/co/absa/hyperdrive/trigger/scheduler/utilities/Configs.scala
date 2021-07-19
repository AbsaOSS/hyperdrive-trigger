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

package za.co.absa.hyperdrive.trigger.scheduler.utilities

import com.typesafe.config.{Config, ConfigFactory}
import org.apache.kafka.clients.consumer.ConsumerConfig
import za.co.absa.hyperdrive.trigger.models.KafkaSensorProperties

import java.io.File
import java.util.Properties
import scala.collection.JavaConverters._
import scala.util.Try

private object Configs {
  private val configPath: Option[String] = Option(System.getProperty("spring.config.location")).filter(_.trim.nonEmpty)
  val conf: Config = configPath match {
    case Some(cp) => ConfigFactory.parseFile(new File(cp))
    case None => ConfigFactory.load()
  }
}

object JobDefinitionConfig {
  val KeysToMerge = Set("spark.executor.extraJavaOptions", "spark.driver.extraJavaOptions")
  val MergedValuesSeparator = " "
}

object ApplicationConfig {
  val maximumNumberOfWorkflowsInBulkRun: Int =
    Try(Configs.conf.getInt("application.maximumNumberOfWorkflowsInBulkRun")).getOrElse(10)
}

object NotificationConfig {
  val notificationEnabled: Boolean = Try(Configs.conf.getBoolean("notification.enabled")).getOrElse(false)
  val notificationSenderAddress: String = Try(Configs.conf.getString("notification.sender.address")).getOrElse("")
}

object GeneralConfig {
  val environment: String =
    Try(Configs.conf.getString("environment")).getOrElse("Unknown")
}