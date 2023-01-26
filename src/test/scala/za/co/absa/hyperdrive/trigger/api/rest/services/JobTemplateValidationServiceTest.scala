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
import za.co.absa.hyperdrive.trigger.api.rest.services.JobTemplateFixture.GenericShellJobTemplate
import za.co.absa.hyperdrive.trigger.models.errors.{ApiException, ValidationError}
import za.co.absa.hyperdrive.trigger.persistance.JobTemplateRepository

import scala.concurrent.{ExecutionContext, Future}

class JobTemplateValidationServiceTest extends AsyncFlatSpec with Matchers with MockitoSugar with BeforeAndAfter {
  override implicit def executionContext: ExecutionContext = scala.concurrent.ExecutionContext.Implicits.global

  private val jobTemplateRepository = mock[JobTemplateRepository]
  private val underTest = new JobTemplateValidationServiceImpl(jobTemplateRepository)

  before {
    reset(jobTemplateRepository)
  }

  "validate" should "succeed if entity is valid" in {
    // given
    val jobTemplate = GenericShellJobTemplate
    when(
      jobTemplateRepository.existsOtherJobTemplate(eqTo(jobTemplate.name), eqTo(jobTemplate.id))(any[ExecutionContext])
    ).thenReturn(Future(false))

    // when
    val result: Unit = await(underTest.validate(jobTemplate))

    // then
    verify(jobTemplateRepository).existsOtherJobTemplate(eqTo(jobTemplate.name), eqTo(jobTemplate.id))(
      any[ExecutionContext]
    )
    result shouldBe((): Unit)
  }

  "validate" should "fail if the job template name is not unique" in {
    // given
    val jobTemplate = GenericShellJobTemplate
    when(
      jobTemplateRepository.existsOtherJobTemplate(eqTo(jobTemplate.name), eqTo(jobTemplate.id))(any[ExecutionContext])
    ).thenReturn(Future(true))

    // when
    val result = the[ApiException] thrownBy await(underTest.validate(jobTemplate))

    // then
    result.apiErrors should have size 1
    result.apiErrors.head shouldBe ValidationError(s"Job template name already exists")
  }

  "validate" should "fail if the job template name is empty" in {
    // given
    val jobTemplate = GenericShellJobTemplate.copy(name = "")
    when(
      jobTemplateRepository.existsOtherJobTemplate(eqTo(jobTemplate.name), eqTo(jobTemplate.id))(any[ExecutionContext])
    ).thenReturn(Future(false))

    // when
    val result = the[ApiException] thrownBy await(underTest.validate(jobTemplate))

    // then
    result.apiErrors should have size 1
    result.apiErrors.head shouldBe ValidationError(s"Job template name must not be empty")
  }
}
