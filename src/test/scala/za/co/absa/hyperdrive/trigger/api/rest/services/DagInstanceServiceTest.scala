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

import org.mockito.ArgumentMatchers.{eq => eqTo, _}
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers}
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.models.{JobParameters, ResolvedJobDefinition, ShellParameters, SparkParameters}
import za.co.absa.hyperdrive.trigger.models.enums.{DagInstanceStatuses, JobStatuses, JobTypes}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ExecutionContext, Future}

class DagInstanceServiceTest extends AsyncFlatSpec with Matchers with MockitoSugar with BeforeAndAfter {
  private val jobTemplateService = mock[JobTemplateService]
  private val underTest = new DagInstanceServiceImpl(jobTemplateService)

  before {
    reset(jobTemplateService)
  }

  "createDagInstance" should "create a dag instance with status inQueue" in {
    // given
    val dagDefinitionJoined = WorkflowFixture.createWorkflowJoined().dagDefinitionJoined
    val resolvedJobDefinitions = createResolvedJobDefinitions()
    val triggeredBy = "triggered-by"
    when(jobTemplateService.resolveJobTemplate(any())(any[ExecutionContext])).thenReturn(Future{resolvedJobDefinitions})

    // when
    val dagInstance = await(underTest.createDagInstance(dagDefinitionJoined, triggeredBy))

    // then
    dagInstance.status shouldBe DagInstanceStatuses.InQueue
    dagInstance.triggeredBy shouldBe triggeredBy
    dagInstance.workflowId shouldBe dagDefinitionJoined.workflowId
    dagInstance.jobInstances should have size 2
    dagInstance.started should not be None
    dagInstance.finished shouldBe None

    val jobInstance1 = dagInstance.jobInstances.head
    val jobDefinition1 = resolvedJobDefinitions.head
    jobInstance1.jobName shouldBe jobDefinition1.name
    jobInstance1.jobParameters shouldBe SparkParameters(jobDefinition1.jobParameters)
    jobInstance1.jobStatus shouldBe JobStatuses.InQueue
    jobInstance1.executorJobId shouldBe None
    jobInstance1.created should not be None
    jobInstance1.updated shouldBe None
    jobInstance1.order shouldBe jobDefinition1.order
    jobInstance1.dagInstanceId shouldBe 0

    val jobInstance2 = dagInstance.jobInstances(1)
    val jobDefinition2 = resolvedJobDefinitions(1)
    jobInstance2.jobName shouldBe jobDefinition2.name
    jobInstance2.jobParameters shouldBe ShellParameters(jobDefinition2.jobParameters)
    jobInstance2.order shouldBe jobDefinition2.order
  }

  it should "create a dag instance with status Skipped" in {
    // given
    val dagDefinitionJoined = WorkflowFixture.createWorkflowJoined().dagDefinitionJoined
    val resolvedJobDefinitions = createResolvedJobDefinitions()
    val triggeredBy = "triggered-by"
    when(jobTemplateService.resolveJobTemplate(any())(any[ExecutionContext])).thenReturn(Future{resolvedJobDefinitions})

    // when
    val dagInstance = await(underTest.createDagInstance(dagDefinitionJoined, triggeredBy, skip = true))

    // then
    dagInstance.status shouldBe DagInstanceStatuses.Skipped
    dagInstance.finished.get shouldBe dagInstance.started
    dagInstance.jobInstances.head.jobStatus shouldBe JobStatuses.Skipped
    dagInstance.jobInstances(1).jobStatus shouldBe JobStatuses.Skipped
    dagInstance.jobInstances(1).updated.get shouldBe dagInstance.jobInstances(1).created

  }


  private def createResolvedJobDefinitions() = {
    Seq(
      ResolvedJobDefinition(
        jobType = JobTypes.Spark,
        name = "Spark Job",
        jobParameters = JobParameters(
          variables = Map("jobJar" -> "/dir/driver.jar",
            "mainClass" -> "aaa.bbb.TestClass",
            "deploymentMode" -> "cluster"
          ),
          maps = Map("aaa" -> List("bbb", "ccc"))
        ),
        order = 1
      ),
      ResolvedJobDefinition(
        jobType = JobTypes.Shell,
        name = "Shell Job",
        jobParameters = JobParameters(
          variables = Map(
            "scriptLocation" -> "testShellScript.sh"
          )
        ),
        order = 2
      )
    )
  }
}
