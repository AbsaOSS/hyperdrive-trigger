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
import za.co.absa.hyperdrive.trigger.api.rest.services.JobTemplateFixture.{GenericShellJobTemplate, GenericSparkJobTemplate}
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.persistance.JobTemplateRepository

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ExecutionContext, Future}

class JobTemplateServiceTest extends AsyncFlatSpec with Matchers with MockitoSugar with BeforeAndAfter {
  private val jobTemplateRepository = mock[JobTemplateRepository]
  private val underTest = new JobTemplateServiceImpl(jobTemplateRepository)

  before {
    reset(jobTemplateRepository)
  }

  "resolveJobTemplate" should "resolve the job template" in {
    // given
    val dagDefinitionJoined = WorkflowFixture.createWorkflowJoined().dagDefinitionJoined
    val jobTemplates = Seq(GenericShellJobTemplate, GenericSparkJobTemplate)
    val triggeredBy = "triggered by"

    when(jobTemplateRepository.getJobTemplatesByIds(any())(any[ExecutionContext])).thenReturn(Future{jobTemplates})

    // when
    val dagInstanceJoined = await(underTest.resolveJobTemplate(dagDefinitionJoined, triggeredBy))

    // then
    val jobInstances = dagInstanceJoined.jobInstances
    dagInstanceJoined.triggeredBy shouldBe triggeredBy
    jobInstances should have size 2
    jobInstances.head.jobType shouldBe JobTypes.Spark
    jobInstances(1).jobType shouldBe JobTypes.Shell
  }

  "getJobTemplates" should "return all job templates" in {
    // given
    val jobTemplates = Seq(GenericShellJobTemplate, GenericSparkJobTemplate)
    when(jobTemplateRepository.getJobTemplates()).thenReturn(Future{jobTemplates})

    // when
    val result = await(underTest.getJobTemplates())

    // then
    result should contain theSameElementsAs(jobTemplates)
  }
}
