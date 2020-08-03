
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
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.enums.{JobTypes, SensorTypes}
import za.co.absa.hyperdrive.trigger.persistance._
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor
import za.co.absa.hyperdrive.trigger.scheduler.sensors.Sensors

import scala.concurrent.ExecutionContext.Implicits.global


class TimeSensorIntegrationTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with RepositoryTestBase {
  private val sensorRepository: SensorRepositoryImpl = new SensorRepositoryImpl {
    override val profile = h2Profile
  }
  private val workflowHistoryRepository: WorkflowHistoryRepositoryImpl = new WorkflowHistoryRepositoryImpl {
    override val profile = h2Profile
  }
  private val workflowRepository: WorkflowRepositoryImpl = new WorkflowRepositoryImpl(workflowHistoryRepository) {
    override val profile = h2Profile
  }
  private val eventRepository: EventRepositoryImpl = new EventRepositoryImpl {
    override val profile = h2Profile
  }
  private val dagDefinitionRepository: DagDefinitionRepositoryImpl = new DagDefinitionRepositoryImpl {
    override val profile = h2Profile
  }
  private val dagInstanceRepository: DagInstanceRepositoryImpl = new DagInstanceRepositoryImpl {
    override val profile = h2Profile
  }

  override def beforeAll: Unit = {
    h2SchemaSetup()
  }

  override def afterAll: Unit = {
    h2SchemaDrop()
  }

  override def afterEach: Unit = {
    clearData()
  }

  it should "persist an event when the time sensor is fired" in {
    val processor = new EventProcessor(eventRepository, dagDefinitionRepository, dagInstanceRepository)
    val sensors = new Sensors(processor, sensorRepository)
    val cronExpression = "0/3 * * * * ?"

    // Persist workflow, sensor and dagDefinition
    val properties = Properties(-1L, Settings(Map("cronExpression" -> cronExpression), Map.empty), Map.empty)
    val sensor = Sensor(-1L, SensorTypes.Time, properties)

    val jobParameters1 = JobParameters(Map("deploymentMode" -> "client", "jobJar" -> "spark-job.jar", "mainClass" -> "TheMainClass"), Map.empty)
    val jobDefinition1 = JobDefinition(-1L, "Time-Sensor Job 1", JobTypes.Spark, jobParameters1, 1)
    val jobParameters2 = JobParameters(Map("deploymentMode" -> "client", "jobJar" -> "spark-job-2.jar", "mainClass" -> "TheMainClass"), Map.empty)
    val jobDefinition2 = JobDefinition(-1L, "Time-Sensor Job 2", JobTypes.Spark, jobParameters2, 2)

    val dagDefinitionJoined = DagDefinitionJoined(-1L, Seq(jobDefinition1, jobDefinition2))
    val workflowJoined = WorkflowJoined("Time-Sensor Workflow", true, "some-project", LocalDateTime.now(), None, sensor, dagDefinitionJoined)
    val userName = "fakeUserName"
    val workflowId = await(workflowRepository.insertWorkflow(workflowJoined, userName)).right.get
    val insertedWorkflow = await(workflowRepository.getWorkflow(workflowId))

    // Start Quartz and register sensor
    sensors.prepareSensors()
    await(sensors.processEvents())

    // Check that event was persisted
    Thread.sleep(5000)
    val allEvents = await(eventRepository.getAllEvents())
    allEvents should not be empty

    // Check that the same time sensor is created exactly once
    val jobKey = insertedWorkflow.sensor.id.toString
    await(sensors.processEvents().map(
      _ => {
        val scheduler = TimeSensorQuartzSchedulerManager.getScheduler
        val jobKeys = scheduler.getJobKeys(GroupMatcher.groupEquals[JobKey](TimeSensor.JOB_GROUP_NAME))
        jobKeys should have size 1
        jobKeys.iterator().next().getName shouldBe jobKey
      }))

    // Check that inactive sensor is removed from quartz
    val workflow = await(workflowRepository.getWorkflows()).head
    await(workflowRepository.switchWorkflowActiveState(workflow.id, userName))
    await(sensors.processEvents().map(
      _ => {
        val scheduler = TimeSensorQuartzSchedulerManager.getScheduler
        val jobKeysAfterClose = scheduler.getJobKeys(GroupMatcher.groupEquals[JobKey](TimeSensor.JOB_GROUP_NAME))
        jobKeysAfterClose shouldBe empty
      }))

    // Stop Quartz
    sensors.cleanUpSensors()
  }
}
