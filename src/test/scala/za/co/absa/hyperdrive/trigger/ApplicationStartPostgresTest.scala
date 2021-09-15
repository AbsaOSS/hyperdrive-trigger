
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
import za.co.absa.hyperdrive.trigger.api.rest.services.{JobTemplateFixture, WorkflowFixture}
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
  @Inject() var jobTemplateRepository: JobTemplateRepository = _
  @Inject() var authConfig: AuthConfig = _
  @Inject() var generalConfig: GeneralConfig = _
  @Inject() var healthConfig: HealthConfig = _
  @Inject() var kafkaConfig: KafkaConfig = _
  @Inject() var notificationConfig: NotificationConfig = _
  @Inject() var schedulerConfig: SchedulerConfig = _
  @Inject() var sparkConfig: SparkConfig = _

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
    healthConfig.databaseConnectionTimeoutMillis shouldBe 120000
    healthConfig.yarnConnectionTestEndpoint shouldBe "/cluster/cluster"
    healthConfig.yarnConnectionTimeoutMillis shouldBe None
    kafkaConfig.groupIdPrefix shouldBe "hyper_drive"
    kafkaConfig.pollDuration shouldBe 500
    kafkaConfig.properties.getProperty("key.deserializer") shouldBe "org.apache.kafka.common.serialization.StringDeserializer"
    kafkaConfig.properties.getProperty("value.deserializer") shouldBe "org.apache.kafka.common.serialization.StringDeserializer"
    kafkaConfig.properties.getProperty("max.poll.records") shouldBe "100"
    kafkaConfig.properties.getProperty("security.protocol") shouldBe "PLAINTEXT"
    sparkConfig.submitApi shouldBe "yarn"
    sparkConfig.hadoopResourceManagerUrlBase shouldBe "http://localhost:8088"
    sparkConfig.yarn.hadoopConfDir shouldBe "/opt/hadoop"
    sparkConfig.yarn.sparkHome shouldBe "/opt/spark"
    sparkConfig.yarn.master shouldBe "yarn"
    sparkConfig.yarn.submitTimeout shouldBe 160000
    sparkConfig.yarn.filesToDeploy shouldBe Seq()
    sparkConfig.yarn.additionalConfs shouldBe Map()
    sparkConfig.userUsedToKillJob shouldBe "Unknown"
    notificationConfig.senderAddress shouldBe "sender <sender@abc.com>"
    notificationConfig.enabled shouldBe true

    hyperDriverManager.isManagerRunning shouldBe true
    val jobTemplateSpark = JobTemplateFixture.GenericSparkJobTemplate
    val jobTemplateShell = JobTemplateFixture.GenericShellJobTemplate
    await(jobTemplateRepository.insertJobTemplate(jobTemplateSpark))
    await(jobTemplateRepository.insertJobTemplate(jobTemplateShell))
    val jobTemplates = await(jobTemplateRepository.getJobTemplates())

    val workflowJoined = WorkflowFixture.createWorkflowJoined()
    val workflowJoinedWithCorrectIds = workflowJoined.copy(
      dagDefinitionJoined = workflowJoined.dagDefinitionJoined.copy(
        jobDefinitions = workflowJoined.dagDefinitionJoined.jobDefinitions.map(
          jobDef => jobDef.copy(jobTemplateId = jobTemplates.find(_.jobParameters.jobType == jobDef.jobParameters.jobType).map(_.id))
        )
      )
    )
    await(workflowRepository.insertWorkflow(workflowJoinedWithCorrectIds, "test-user"))
    val workflows = await(workflowRepository.getWorkflows())
    workflows.size shouldBe 1
    workflows.head.name shouldBe workflowJoinedWithCorrectIds.name

    import api._
    run(sqlu"drop view dag_run_view")
    schemaDrop()
  }
}
