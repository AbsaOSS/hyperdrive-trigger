
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

import javax.inject.Inject
import org.scalatest.{FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.SpringIntegrationTest
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.api.rest.services.{WorkflowFixture, WorkflowService}

import scala.concurrent.ExecutionContext.Implicits.global

class WorkflowsInserterLocal extends FlatSpec with Matchers with SpringIntegrationTest with LocalDatabaseConfig {

  @Inject() var workflowService: WorkflowService = _

  it should "insert kafka offloading workflows" taggedAs PersistingData in {
    val numberOfProjects = 20
    val workflowsPerProject = 4
    for {
      i <- 1 to numberOfProjects
      j <- 1 to workflowsPerProject
    } yield {
      val workflow = WorkflowFixture.createKafkaOffloadingWorkflow(s"Project $i")
      val result = await(workflowService.createWorkflow(workflow))
      result.isRight shouldBe true
    }
  }
}
