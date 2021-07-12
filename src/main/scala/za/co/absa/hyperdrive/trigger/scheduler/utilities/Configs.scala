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

  def getMapFromConf(propertyName: String): Map[String, String] = {
    Try {
      def getKeys(path: String): Seq[String] = {
        Try(Configs.conf.getObject(path).keySet().asScala).getOrElse(Set.empty[String]) match {
          case keys if keys.nonEmpty => keys.flatMap(k => getKeys(s"$path.$k")).toSeq
          case keys if keys.isEmpty => Seq(path)
        }
      }
      val keys = getKeys(propertyName)
      keys.map(k => (k.stripPrefix(s"$propertyName."), conf.getString(k))).toMap
    }.getOrElse(Map.empty[String, String])
  }
}

object KafkaConfig {
  private val keyDeserializer = Configs.conf.getString("kafkaSource.key.deserializer")
  private val valueDeserializer = Configs.conf.getString("kafkaSource.value.deserializer")
  private val maxPollRecords = Configs.conf.getString("kafkaSource.max.poll.records")
  def getConsumerProperties(kafkaSensorProperties: KafkaSensorProperties): Properties = {
    val properties = new Properties()
    properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaSensorProperties.servers.mkString(","))
    properties.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, keyDeserializer)
    properties.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, valueDeserializer)
    properties.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, maxPollRecords)

    Configs.getMapFromConf("kafkaSource.properties").foreach { case (key, value)  =>
      properties.put(key, value)
    }

    properties
  }

  val getBaseGroupId: String =
    s"${Configs.conf.getString("kafkaSource.group.id.prefix")}_${Configs.conf.getString("appUniqueId")}"
  val getPollDuration: Long =
    Configs.conf.getLong("kafkaSource.poll.duration")
}

object SensorsConfig {
  val getThreadPoolSize: Int =
    Configs.conf.getInt("scheduler.sensors.thread.pool.size")
  val getChangedSensorsChunkQuerySize: Int =
    Configs.conf.getInt("scheduler.sensors.changedSensorsChunkQuerySize")
}

object SchedulerConfig {
  val getHeartBeat: Int =
    Configs.conf.getInt("scheduler.heart.beat")
  val getMaxParallelJobs: Int =
    Configs.conf.getInt("scheduler.jobs.parallel.number")
  val isAutostart: Boolean =
    Try(Configs.conf.getBoolean("scheduler.autostart")).getOrElse(true)
}

object ExecutorsConfig {
  val getThreadPoolSize: Int =
    Configs.conf.getInt("scheduler.executors.thread.pool.size")
}

object ShellExecutorConfig {
  val getExecutablesFolder: String =
    Configs.conf.getString("shellExecutor.executablesFolder")
}

object SparkExecutorConfig {
  val getSubmitTimeOut: Int =
    Configs.conf.getInt("sparkYarnSink.submitTimeout")
  val getHadoopConfDir: String =
    Configs.conf.getString("sparkYarnSink.hadoopConfDir")
  val getMaster: String =
    Configs.conf.getString("sparkYarnSink.master")
  val getSparkHome: String =
    Configs.conf.getString("sparkYarnSink.sparkHome")
  val getHadoopResourceManagerUrlBase: String =
    Configs.conf.getString("sparkYarnSink.hadoopResourceManagerUrlBase")
  val getFilesToDeploy: Seq[String] =
    Try(Configs.conf.getString("sparkYarnSink.filesToDeploy").split(",").toSeq).getOrElse(Seq.empty[String])
  val getAdditionalConfs: Map[String, String] =
    Configs.getMapFromConf("sparkYarnSink.additionalConfs")
  val getExecutablesFolder: String =
    Configs.conf.getString("sparkYarnSink.executablesFolder")
  val getUserUsedToKillJob: String =
    Try(Configs.conf.getString("sparkYarnSink.userUsedToKillJob")).getOrElse("Unknown")
}

object JobDefinitionConfig {
  val KeysToMerge = Set("spark.executor.extraJavaOptions", "spark.driver.extraJavaOptions")
  val MergedValuesSeparator = " "
}

object HealthConfig {
  lazy val databaseConnectionTimeoutMillis: Int =
    Try(Configs.conf.getInt("health.databaseConnection.timeoutMillis")).getOrElse(120000)
  lazy val yarnConnectionTestEndpoint: String = {
    Configs.conf.getString("health.yarnConnection.testEndpoint")
  }
  lazy val yarnConnectionTimeoutMillisOpt: Option[Int] =
    Try(Configs.conf.getInt("health.yarnConnection.timeoutMillis")).toOption
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