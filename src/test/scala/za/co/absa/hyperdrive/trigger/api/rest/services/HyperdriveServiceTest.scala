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

package za.co.absa.hyperdrive.trigger.api.rest.services

import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{reset, when}
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers}
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.models.{ResolvedJobDefinition, ShellInstanceParameters, SparkInstanceParameters}
import za.co.absa.hyperdrive.trigger.models.{IngestionStatus, TopicStatus}
import za.co.absa.hyperdrive.trigger.persistance.WorkflowRepository

import scala.concurrent.Future

class HyperdriveServiceTest extends AsyncFlatSpec with Matchers with BeforeAndAfter with MockitoSugar {
  private val workflowRepository = mock[WorkflowRepository]
  private val jobTemplateService = mock[JobTemplateService]
  private val hyperdriveOffsetService = mock[HyperdriveOffsetService]
  private val underTest = new HyperdriveServiceImpl(workflowRepository, jobTemplateService, hyperdriveOffsetService)

  before {
    reset(workflowRepository)
    reset(jobTemplateService)
    reset(hyperdriveOffsetService)
  }

  "getIngestionStatus" should "fail on get workflow failure" in {
    val id = 1
    val error = "error"
    when(workflowRepository.getWorkflow(any())(any())).thenReturn(Future.failed(new Exception(error)))

    recoverToSucceededIf[Exception] {
      underTest.getIngestionStatus(id)
    }
  }

  it should "fail on resolve job template failure" in {
    val id = 1
    val error = "error"

    when(workflowRepository.getWorkflow(any())(any())).thenReturn(Future(WorkflowFixture.createWorkflowJoined()))
    when(jobTemplateService.resolveJobTemplate(any())(any())).thenReturn(Future.failed(new Exception(error)))

    recoverToSucceededIf[Exception] {
      underTest.getIngestionStatus(id)
    }
  }

  it should "succeed" in {
    val id = 1
    val error = "error"
    val resolvedJobDefinitions = Seq(
      ResolvedJobDefinition(
        name = "JobA",
        jobParameters = SparkInstanceParameters(jobType = JobTypes.Hyperdrive, jobJar = "", mainClass = ""),
        order = 0
      ),
      ResolvedJobDefinition(
        name = "JobB",
        jobParameters = SparkInstanceParameters(jobType = JobTypes.Hyperdrive, jobJar = "", mainClass = ""),
        order = 1
      ),
      ResolvedJobDefinition(
        name = "JobC",
        jobParameters = SparkInstanceParameters(jobType = JobTypes.Spark, jobJar = "", mainClass = ""),
        order = 2
      ),
      ResolvedJobDefinition(name = "JobD", jobParameters = ShellInstanceParameters(scriptLocation = ""), order = 3)
    )
    val expectedResult = Seq(
      IngestionStatus(
        jobName = "JobA",
        JobTypes.Hyperdrive.name,
        topicStatus = Some(TopicStatus(topic = "topic", messagesToIngest = Map.empty))
      ),
      IngestionStatus(jobName = "JobB", JobTypes.Hyperdrive.name, topicStatus = None),
      IngestionStatus(jobName = "JobC", JobTypes.Spark.name, topicStatus = None),
      IngestionStatus(jobName = "JobD", JobTypes.Shell.name, topicStatus = None)
    )
    when(workflowRepository.getWorkflow(any())(any())).thenReturn(Future(WorkflowFixture.createWorkflowJoined()))
    when(jobTemplateService.resolveJobTemplate(any())(any())).thenReturn(Future(resolvedJobDefinitions))
    when(hyperdriveOffsetService.getNumberOfMessagesLeft(any())(any()))
      .thenReturn(Future(Some(("topic", Map.empty[Int, Long]))))
      .thenReturn(Future.failed(new Exception(error)))

    underTest.getIngestionStatus(id).map { result =>
      result shouldBe expectedResult
    }
  }
}
