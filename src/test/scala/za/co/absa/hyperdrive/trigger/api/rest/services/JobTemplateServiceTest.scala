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
import za.co.absa.hyperdrive.trigger.api.rest.services.JobTemplateFixture.{
  GenericShellJobTemplate,
  GenericSparkJobTemplate
}
import za.co.absa.hyperdrive.trigger.models.{ResolvedJobDefinition, ShellInstanceParameters, SparkInstanceParameters}
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.models.errors.{ApiException, ValidationError}
import za.co.absa.hyperdrive.trigger.models.search.{TableSearchRequest, TableSearchResponse}
import za.co.absa.hyperdrive.trigger.persistance.JobTemplateRepository

import scala.concurrent.{ExecutionContext, Future}

class JobTemplateServiceTest extends AsyncFlatSpec with Matchers with MockitoSugar with BeforeAndAfter {
  override implicit def executionContext: ExecutionContext = scala.concurrent.ExecutionContext.Implicits.global

  private val jobTemplateRepository = mock[JobTemplateRepository]
  private val jobTemplateResolutionUtil = mock[JobTemplateResolutionService]
  private val jobTemplateValidationService = mock[JobTemplateValidationService]
  private val underTest =
    new JobTemplateServiceImpl(jobTemplateRepository, jobTemplateResolutionUtil, jobTemplateValidationService) {
      override private[services] def getUserName: () => String = () => userName
    }
  private val userName = "test-user"

  before {
    reset(jobTemplateRepository)
    reset(jobTemplateResolutionUtil)
    reset(jobTemplateValidationService)
  }

  "resolveJobTemplate" should "resolve the job template" in {
    // given
    val dagDefinitionJoined = WorkflowFixture.createWorkflowJoined().dagDefinitionJoined
    val jobTemplates = Seq(GenericShellJobTemplate, GenericSparkJobTemplate)
    val resolvedJobDefinitions = Seq(
      ResolvedJobDefinition(
        name = "JobA",
        jobParameters = SparkInstanceParameters(jobType = JobTypes.Spark, jobJar = "", mainClass = ""),
        order = 0
      ),
      ResolvedJobDefinition(name = "JobB", jobParameters = ShellInstanceParameters(scriptLocation = ""), order = 1)
    )

    when(jobTemplateRepository.getJobTemplatesByIds(any())(any[ExecutionContext])).thenReturn(Future(jobTemplates))
    when(jobTemplateResolutionUtil.resolveDagDefinitionJoined(any(), any())).thenReturn(resolvedJobDefinitions)

    // when
    val result = await(underTest.resolveJobTemplate(dagDefinitionJoined))

    // then
    result should have size 2
    result.head.jobParameters.jobType shouldBe JobTypes.Spark
    result(1).jobParameters.jobType shouldBe JobTypes.Shell
  }

  "getJobTemplates" should "return all job templates" in {
    // given
    val jobTemplates = Seq(GenericShellJobTemplate, GenericSparkJobTemplate)
    when(jobTemplateRepository.getJobTemplates()).thenReturn(Future(jobTemplates))

    // when
    val result = await(underTest.getJobTemplates())

    // then
    result should contain theSameElementsAs jobTemplates
  }

  "getJobTemplatesByIds" should "return job templates by ids" in {
    // given
    val jobTemplates = Seq(GenericShellJobTemplate, GenericSparkJobTemplate)
    when(jobTemplateRepository.getJobTemplatesByIds(eqTo(Seq(1, 2)))(any[ExecutionContext])).thenReturn(Future {
      jobTemplates
    })

    // when
    val result = await(underTest.getJobTemplatesByIds(Seq(1, 2)))

    // then
    result should contain theSameElementsAs jobTemplates
  }

  "getJobTemplateIdsByNames" should "return a mapping from names to template ids" in {
    // given
    val jobTemplateNames = Seq("Template A", "Template B")
    val jobTemplateIdNameMap = Map("Template A" -> 11L, "Template B" -> 12L)
    when(jobTemplateRepository.getJobTemplateIdsByNames(eqTo(jobTemplateNames))(any[ExecutionContext]))
      .thenReturn(Future(jobTemplateIdNameMap))

    // when
    val result = await(underTest.getJobTemplateIdsByNames(jobTemplateNames))

    // then
    result should contain theSameElementsAs jobTemplateIdNameMap
  }

  "searchJobTemplates" should "return table search response with job templates which meet search criteria" in {
    // given
    val jobTemplates = Seq(GenericShellJobTemplate, GenericSparkJobTemplate)
    val searchRequest = TableSearchRequest(sort = None, from = 0, size = 100)
    val searchResponse = TableSearchResponse(items = jobTemplates, total = jobTemplates.length)

    when(jobTemplateRepository.searchJobTemplates(eqTo(searchRequest))(any[ExecutionContext])).thenReturn(Future {
      searchResponse
    })

    // when
    val result = await(underTest.searchJobTemplates(searchRequest))

    // then
    result.items should contain theSameElementsAs jobTemplates
    result.total shouldBe jobTemplates.length
  }

  "getJobTemplate" should "return job template by id" in {
    // given
    val jobTemplate = GenericShellJobTemplate
    when(jobTemplateRepository.getJobTemplate(jobTemplate.id)).thenReturn(Future(jobTemplate))

    // when
    val result = await(underTest.getJobTemplate(jobTemplate.id))

    // then
    result shouldBe jobTemplate
  }

  "createJobTemplate" should "create a job template" in {
    // given
    val jobTemplate = GenericShellJobTemplate
    when(jobTemplateRepository.insertJobTemplate(eqTo(jobTemplate), eqTo(userName))(any[ExecutionContext]))
      .thenReturn(Future(jobTemplate.id))
    when(jobTemplateValidationService.validate(eqTo(jobTemplate))(any[ExecutionContext]())).thenReturn(Future {
      (): Unit
    })

    // when
    val result = await(underTest.createJobTemplate(jobTemplate))

    // then
    verify(jobTemplateValidationService).validate(eqTo(jobTemplate))(any[ExecutionContext]())
    result shouldBe jobTemplate
  }

  "createJobTemplate" should "throw an exception if the validation failed" in {
    // given
    val jobTemplate = GenericShellJobTemplate
    when(jobTemplateRepository.insertJobTemplate(eqTo(jobTemplate), eqTo(userName))(any[ExecutionContext]))
      .thenReturn(Future(jobTemplate.id))
    when(jobTemplateValidationService.validate(eqTo(jobTemplate))(any[ExecutionContext]()))
      .thenReturn(Future.failed(new ApiException(Seq(ValidationError("error")))))

    // when
    val result = the[ApiException] thrownBy await(underTest.createJobTemplate(jobTemplate))

    // then
    result.apiErrors.head.message shouldBe "error"
  }

  "updateJobTemplate" should "update a job template" in {
    // given
    val jobTemplate = GenericShellJobTemplate
    when(jobTemplateRepository.updateJobTemplate(eqTo(jobTemplate), eqTo(userName))(any[ExecutionContext]))
      .thenReturn(Future((): Unit))
    when(jobTemplateValidationService.validate(eqTo(jobTemplate))(any[ExecutionContext]())).thenReturn(Future {
      (): Unit
    })

    // when
    val result = await(underTest.updateJobTemplate(jobTemplate))

    // then
    verify(jobTemplateValidationService).validate(eqTo(jobTemplate))(any[ExecutionContext]())
    result shouldBe jobTemplate
  }

  "updateJobTemplate" should "throw an exception if the validation failed" in {
    // given
    val jobTemplate = GenericShellJobTemplate
    when(jobTemplateRepository.updateJobTemplate(eqTo(jobTemplate), eqTo(userName))(any[ExecutionContext]))
      .thenReturn(Future((): Unit))
    when(jobTemplateValidationService.validate(eqTo(jobTemplate))(any[ExecutionContext]()))
      .thenReturn(Future.failed(new ApiException(Seq(ValidationError("error")))))

    // when
    val result = the[ApiException] thrownBy await(underTest.updateJobTemplate(jobTemplate))

    // then
    result.apiErrors.head.message shouldBe "error"
  }

  "deleteJobTemplate" should "delete a job template" in {
    // given
    val jobTemplate = GenericSparkJobTemplate
    when(jobTemplateRepository.deleteJobTemplate(eqTo(jobTemplate.id), eqTo(userName))(any[ExecutionContext]))
      .thenReturn(Future((): Unit))

    // when
    val result = await(underTest.deleteJobTemplate(jobTemplate.id))

    // then
    result shouldBe true
  }

  "getWorkflowsByJobTemplate" should "return workflows where job template is used" in {
    // given
    val jobTemplateId = 1
    val workflows =
      Seq(WorkflowFixture.createWorkflowJoined().toWorkflow, WorkflowFixture.createWorkflowJoined().toWorkflow)
    when(jobTemplateRepository.getWorkflowsByJobTemplate(jobTemplateId)).thenReturn(Future(workflows))

    // when
    val result = await(underTest.getWorkflowsByJobTemplate(jobTemplateId))

    // then
    result shouldBe workflows
  }
}
