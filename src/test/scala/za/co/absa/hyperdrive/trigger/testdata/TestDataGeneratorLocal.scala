
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

package za.co.absa.hyperdrive.trigger.testdata

import java.util.UUID

import javax.inject.Inject
import org.scalatest.{BeforeAndAfterAll, FlatSpec, Matchers}
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.User
import play.api.libs.json.JsObject
import za.co.absa.hyperdrive.trigger.SpringIntegrationTest
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.api.rest.services.{WorkflowFixture, WorkflowService}
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses
import za.co.absa.hyperdrive.trigger.models.{Event, Properties, Settings}
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, SensorRepository}
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor

import scala.concurrent.ExecutionContext.Implicits.global

class TestDataGeneratorLocal extends FlatSpec with Matchers with SpringIntegrationTest with LocalDatabaseConfig
  with BeforeAndAfterAll {

  @Inject() var workflowService: WorkflowService = _
  @Inject() var eventProcessor: EventProcessor = _
  @Inject() var sensorRepository: SensorRepository = _
  @Inject() var dagInstanceRepository: DagInstanceRepository = _

  val random = new scala.util.Random(1)

  override def beforeAll(): Unit = {
    super.beforeAll()
    import scala.collection.JavaConverters._
    val auth = new UsernamePasswordAuthenticationToken(new User("user1234", "password", Set.empty.asJava), null)
    SecurityContextHolder.getContext.setAuthentication(auth)
  }

  it should "insert kafka offloading workflows" taggedAs PersistingData in {
    val numberOfProjects = 20
    val workflowsPerProject = 4
    for {
      i <- 1 to numberOfProjects
      _ <- 1 to workflowsPerProject
    } yield {
      val workflow = WorkflowFixture.createKafkaOffloadingWorkflow(s"Project $i")
      val result = await(workflowService.createWorkflow(workflow))
      result.name shouldBe workflow.name
    }
  }

  it should "insert timebase shellscript workflows" taggedAs PersistingData in {
    val numberOfProjects = 20
    val workflowsPerProject = 1
    for {
      i <- 1 to numberOfProjects
      _ <- 1 to workflowsPerProject
    } yield {
      val workflow = WorkflowFixture.createTimeBasedShellScriptWorkflow(s"Project $i")
      val result = await(workflowService.createWorkflow(workflow))
      result.name shouldBe workflow.name
    }
  }

  it should "insert job runs for active sensors" taggedAs PersistingData in {
    val allWorkflowIds = await(workflowService.getWorkflows()).map(_.id)
    val sensors = await(sensorRepository.getNewActiveAssignedSensors(Seq.empty, allWorkflowIds))
    sensors.foreach(sensor => {
      val event = Event(UUID.randomUUID().toString, sensor.id, JsObject.empty)
      val properties = Properties(sensor.id, Settings(Map.empty, Map.empty), Map.empty)
      val result = await(eventProcessor.eventProcessor("triggered by")(Seq(event), properties))
      result shouldBe true
    })

    val dagInstances = await(dagInstanceRepository.getDagsToRun(Seq.empty, 1000))
    dagInstances.foreach(dagInstance => {
      val finished = Some(dagInstance.started.plusSeconds(random.nextInt(86400)))
      val updatedDagInstance = random.nextInt(4) match {
        case 1 => dagInstance.copy(status = DagInstanceStatuses.Running)
        case 2 => dagInstance.copy(status = DagInstanceStatuses.Succeeded, finished = finished)
        case 3 => dagInstance.copy(status = DagInstanceStatuses.Failed, finished = finished)
        case _ => dagInstance
      }
      await(dagInstanceRepository.update(updatedDagInstance))
    })
  }
}
