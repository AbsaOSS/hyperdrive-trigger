
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

package za.co.absa.hyperdrive.trigger

import org.scalatest.{FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.api.rest.services.WorkflowFixture
import za.co.absa.hyperdrive.trigger.configuration.application._
import za.co.absa.hyperdrive.trigger.persistance._

import java.time.Duration
import javax.inject.Inject
import scala.concurrent.ExecutionContext.Implicits.global

class ApplicationStartPostgresTest extends FlatSpec with Matchers with SpringIntegrationTest
  with RepositoryPostgresTestBase {

  @Inject() var injectedDbProvider: DatabaseProvider = _
  @Inject() var hyperDriverManager: HyperDriverManager = _
  @Inject() var workflowHistoryRepository: WorkflowHistoryRepository = _
  @Inject() var workflowRepository: WorkflowRepository = _

  @Inject() var authConfig: AuthConfig = _
  @Inject() var generalConfig: GeneralConfig = _
  @Inject() var healthConfig: HealthConfig = _
  @Inject() var kafkaConfig: KafkaConfig = _
  @Inject() var notificationConfig: NotificationConfig = _
  @Inject() var schedulerConfig: SchedulerConfig = _
  @Inject() var shellExecutorConfig: ShellExecutorConfig = _
  @Inject() var sparkYarnSinkConfig: SparkYarnSinkConfig = _

  override val dbProvider: DatabaseProvider = new DatabaseProvider(TestDatabaseConfig(Map())) {
    override lazy val db: DatabaseProvider.profile.backend.DatabaseDef = injectedDbProvider.db
  }

  override def beforeAll(): Unit = {
    import scala.collection.JavaConverters._
    databaseConfig.dbProperties.asScala.foreach { case (key, value) =>
      System.setProperty(s"db.${key}", value)
    }

    super.beforeAll()
  }

  it should "start the application, including sql migrations, and be able to insert and select from the DB" in {
    authConfig.mechanism shouldBe "inmemory"
    generalConfig.environment shouldBe "TEST"
    generalConfig.version shouldBe "Unknown"
    generalConfig.appUniqueId shouldBe "9c282190-4078-4380-8960-ce52f43b94fg"
    schedulerConfig.autostart shouldBe true
    schedulerConfig.lagThreshold shouldBe Duration.ofSeconds(20L)
    schedulerConfig.heartBeat shouldBe 5000
    schedulerConfig.maxParallelJobs shouldBe 100
    schedulerConfig.sensors.threadPoolSize shouldBe 20
    schedulerConfig.sensors.changedSensorsChunkQuerySize shouldBe 100
    schedulerConfig.executors.threadPoolSize shouldBe 30
    shellExecutorConfig.executablesFolder shouldBe "src/test/resources/"
    healthConfig.databaseConnection.timeoutMillis shouldBe 120000
    healthConfig.yarnConnection.testEndpoint shouldBe "/cluster/cluster"
    healthConfig.yarnConnection.timeoutMillis shouldBe None
    kafkaConfig.groupIdPrefix shouldBe "hyper_drive"
    kafkaConfig.pollDuration shouldBe 500
    kafkaConfig.properties.getProperty("key.deserializer") shouldBe "org.apache.kafka.common.serialization.StringDeserializer"
    kafkaConfig.properties.getProperty("value.deserializer") shouldBe "org.apache.kafka.common.serialization.StringDeserializer"
    kafkaConfig.properties.getProperty("max.poll.records") shouldBe "100"
    kafkaConfig.properties.getProperty("security.protocol") shouldBe "PLAINTEXT"
    sparkYarnSinkConfig.hadoopResourceManagerUrlBase shouldBe "http://localhost:8088"
    sparkYarnSinkConfig.hadoopConfDir shouldBe "/opt/hadoop"
    sparkYarnSinkConfig.sparkHome shouldBe "/opt/spark"
    sparkYarnSinkConfig.master shouldBe "yarn"
    sparkYarnSinkConfig.submitTimeout shouldBe 160000
    sparkYarnSinkConfig.executablesFolder shouldBe ""
    sparkYarnSinkConfig.filesToDeploy shouldBe Seq()
    sparkYarnSinkConfig.additionalConfs shouldBe Map()
    sparkYarnSinkConfig.userUsedToKillJob shouldBe "Unknown"
    notificationConfig.senderAddress shouldBe "sender <sender@abc.com>"
    notificationConfig.enabled shouldBe true

    hyperDriverManager.isManagerRunning shouldBe true
    val workflowJoined = WorkflowFixture.createWorkflowJoined()
    await(workflowRepository.insertWorkflow(workflowJoined, "test-user"))
    val workflows = await(workflowRepository.getWorkflows())
    workflows.size shouldBe 1
    workflows.head.name shouldBe workflowJoined.name

    import api._
    run(sqlu"drop view dag_run_view")
    schemaDrop()
  }
}
