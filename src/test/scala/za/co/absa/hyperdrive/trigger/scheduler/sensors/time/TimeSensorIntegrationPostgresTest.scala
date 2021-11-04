
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

package za.co.absa.hyperdrive.trigger.scheduler.sensors.time

import java.time.LocalDateTime
import org.quartz.JobKey
import org.quartz.impl.matchers.GroupMatcher
import org.scalatest._
import za.co.absa.hyperdrive.trigger.api.rest.services.{DagInstanceService, DagInstanceServiceImpl, JobTemplateFixture, JobTemplateResolutionServiceImpl, JobTemplateService, JobTemplateServiceImpl, JobTemplateValidationServiceImpl}
import za.co.absa.hyperdrive.trigger.configuration.application.{GeneralConfig, KafkaConfig, SchedulerConfig, TestGeneralConfig, TestKafkaConfig, TestSchedulerConfig}
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.persistance._
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor
import za.co.absa.hyperdrive.trigger.scheduler.sensors.Sensors

import scala.concurrent.ExecutionContext.Implicits.global


class TimeSensorIntegrationPostgresTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with RepositoryPostgresTestBase {
  private val schedulerConfig: SchedulerConfig = TestSchedulerConfig()
  private val kafkaConfig: KafkaConfig = TestKafkaConfig()
  private val generalConfig: GeneralConfig = TestGeneralConfig()
  private val sensorRepository: SensorRepositoryImpl = new SensorRepositoryImpl(dbProvider, schedulerConfig)
  private val workflowHistoryRepository: WorkflowHistoryRepositoryImpl = new WorkflowHistoryRepositoryImpl(dbProvider)
  private val workflowRepository: WorkflowRepositoryImpl = new WorkflowRepositoryImpl(dbProvider, workflowHistoryRepository)
  private val eventRepository: EventRepositoryImpl = new EventRepositoryImpl(dbProvider)
  private val dagDefinitionRepository: DagDefinitionRepositoryImpl = new DagDefinitionRepositoryImpl(dbProvider)
  private val dagInstanceRepository: DagInstanceRepositoryImpl = new DagInstanceRepositoryImpl(dbProvider)
  private val jobTemplateHistoryRepository: JobTemplateHistoryRepositoryImpl = new JobTemplateHistoryRepositoryImpl(dbProvider)
  private val jobTemplateRepository: JobTemplateRepositoryImpl = new JobTemplateRepositoryImpl(dbProvider, jobTemplateHistoryRepository)
  private val jobTemplateResolutionService: JobTemplateResolutionServiceImpl = new JobTemplateResolutionServiceImpl
  private val jobTemplateValidationService: JobTemplateValidationServiceImpl = new JobTemplateValidationServiceImpl(jobTemplateRepository)
  private val jobTemplateService: JobTemplateService = new JobTemplateServiceImpl(jobTemplateRepository, jobTemplateResolutionService, jobTemplateValidationService)
  private val dagInstanceService: DagInstanceService = new DagInstanceServiceImpl(jobTemplateService)

  override def beforeAll: Unit = {
    super.beforeAll()
    schemaSetup()
  }

  override def afterAll: Unit = {
    schemaDrop()
  }

  override def afterEach: Unit = {
    clearData()
  }

  it should "persist an event when the time sensor is fired" in {
    val processor = new EventProcessor(eventRepository, dagDefinitionRepository, dagInstanceRepository, dagInstanceService)
    val sensors = new Sensors(processor, sensorRepository, dagInstanceRepository, kafkaConfig, generalConfig, schedulerConfig)
    val cronExpression = "0/3 * * * * ?"
    val testUser = "test-user"

    val sparkTemplate = JobTemplateFixture.GenericSparkJobTemplate
    val sparkTemplateId = await(jobTemplateRepository.insertJobTemplate(sparkTemplate, testUser))

    // Persist workflow, sensor and dagDefinition
    val properties = TimeSensorProperties(cronExpression = cronExpression)
    val sensor = Sensor[SensorProperties](-1L, properties)

    val jobParameters1 = SparkDefinitionParameters(jobType = JobTypes.Spark, jobJar = Option("spark-job.jar"), mainClass = Option("TheMainClass"))
    val jobDefinition1 = JobDefinition(-1L, Some(sparkTemplateId), "Time-Sensor Job 1", jobParameters1, 1)
    val jobParameters2 = SparkDefinitionParameters(jobType = JobTypes.Spark, jobJar = Option("spark-job-2.jar"), mainClass = Option("TheMainClass"))
    val jobDefinition2 = JobDefinition(-1L, Some(sparkTemplateId), "Time-Sensor Job 2", jobParameters2, 2)

    val dagDefinitionJoined = DagDefinitionJoined(-1L, Seq(jobDefinition1, jobDefinition2))
    val workflowJoined = WorkflowJoined("Time-Sensor Workflow", true, "some-project", LocalDateTime.now(), None, None, sensor, dagDefinitionJoined)
    val userName = "fakeUserName"
    val workflowId = await(workflowRepository.insertWorkflow(workflowJoined, userName))
    val insertedWorkflow = await(workflowRepository.getWorkflow(workflowId))

    // Start Quartz and register sensor
    sensors.prepareSensors()
    await(sensors.processEvents(Seq(workflowId), firstIteration = false))

    // Check that event was persisted
    Thread.sleep(5000)
    val allEvents = await(eventRepository.getAllEvents())
    allEvents should not be empty

    // Check that the same time sensor is created exactly once
    val jobKey = insertedWorkflow.sensor.id.toString
    await(sensors.processEvents(Seq(workflowId), firstIteration = false).map(
      _ => {
        val scheduler = TimeSensorQuartzSchedulerManager.getScheduler
        val jobKeys = scheduler.getJobKeys(GroupMatcher.groupEquals[JobKey](TimeSensor.JOB_GROUP_NAME))
        jobKeys should have size 1
        jobKeys.iterator().next().getName shouldBe jobKey
      }))

    // Check that inactive sensor is removed from quartz
    val workflow = await(workflowRepository.getWorkflows()).head
    await(workflowRepository.switchWorkflowActiveState(workflow.id, userName))
    await(sensors.processEvents(Seq(workflowId), firstIteration = false).map(
      _ => {
        val scheduler = TimeSensorQuartzSchedulerManager.getScheduler
        val jobKeysAfterClose = scheduler.getJobKeys(GroupMatcher.groupEquals[JobKey](TimeSensor.JOB_GROUP_NAME))
        jobKeysAfterClose shouldBe empty
      }))

    // Stop Quartz
    sensors.cleanUpSensors()
  }
}
