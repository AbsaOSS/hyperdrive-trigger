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
import za.co.absa.hyperdrive.trigger.models.NotificationRule
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses
import za.co.absa.hyperdrive.trigger.models.errors.{ApiException, ValidationError}
import za.co.absa.hyperdrive.trigger.persistance.WorkflowRepository

import scala.concurrent.{ExecutionContext, Future}

class NotificationRuleValidationServiceTest extends AsyncFlatSpec with Matchers with MockitoSugar with BeforeAndAfter {
  override implicit def executionContext: ExecutionContext = scala.concurrent.ExecutionContext.Implicits.global

  private val workflowRepository = mock[WorkflowRepository]
  private val underTest = new NotificationRuleValidationServiceImpl(workflowRepository)

  before {
    reset(workflowRepository)
  }

  "validate" should "succeed if entity is valid" in {
    // given
    val notificationRule = createNotificationRule()
    when(workflowRepository.existsProject(eqTo(notificationRule.project.get))(any[ExecutionContext]))
      .thenReturn(Future(true))
    when(workflowRepository.existsWorkflowWithPrefix(eqTo(notificationRule.workflowPrefix.get))(any[ExecutionContext]))
      .thenReturn(Future(true))

    // when
    underTest.validate(notificationRule).map { _ =>
      // then
      verify(workflowRepository).existsProject(eqTo(notificationRule.project.get))(any[ExecutionContext])
      verify(workflowRepository).existsWorkflowWithPrefix(eqTo(notificationRule.workflowPrefix.get))(
        any[ExecutionContext]
      )
      succeed
    }
  }

  it should "succeed if neither project nor workflowPrefix are specified" in {
    // given
    val notificationRule = createNotificationRule().copy(project = None, workflowPrefix = None)

    // when
    underTest.validate(notificationRule).map { _ =>
      // then
      verify(workflowRepository, never()).existsProject(any())(any())
      verify(workflowRepository, never()).existsWorkflowWithPrefix(any())(any())
      succeed
    }
  }

  it should "succeed if both project and workflowPrefix are empty" in {
    // given
    val notificationRule = createNotificationRule().copy(project = Some(""), workflowPrefix = Some(""))

    // when
    underTest.validate(notificationRule).map { _ =>
      // then
      verify(workflowRepository, never()).existsProject(any())(any())
      verify(workflowRepository, never()).existsWorkflowWithPrefix(any())(any())
      succeed
    }
  }

  it should "succeed if minElapsedSeconds is > 0" in {
    // given
    val notificationRule = createNotificationRule().copy(minElapsedSecondsSinceLastSuccess = Some(123))
    when(workflowRepository.existsProject(eqTo(notificationRule.project.get))(any[ExecutionContext]))
      .thenReturn(Future(true))
    when(workflowRepository.existsWorkflowWithPrefix(eqTo(notificationRule.workflowPrefix.get))(any[ExecutionContext]))
      .thenReturn(Future(true))

    // when
    underTest.validate(notificationRule).map { _ =>
      // then
      succeed
    }
  }

  it should "fail if the project doesn't exist" in {
    // given
    val notificationRule = createNotificationRule()
    when(workflowRepository.existsProject(eqTo(notificationRule.project.get))(any[ExecutionContext]))
      .thenReturn(Future(false))
    when(workflowRepository.existsWorkflowWithPrefix(eqTo(notificationRule.workflowPrefix.get))(any[ExecutionContext]))
      .thenReturn(Future(true))

    // when
    underTest.validate(notificationRule).failed.map { error =>
      // then
      val result = error.asInstanceOf[ApiException]
      result.apiErrors should have size 1
      result.apiErrors.head shouldBe ValidationError(s"No project with name ${notificationRule.project.get} exists")
    }
  }

  it should "fail if the workflow prefix doesn't match any workflows" in {
    // given
    val notificationRule = createNotificationRule()
    when(workflowRepository.existsProject(eqTo(notificationRule.project.get))(any[ExecutionContext]))
      .thenReturn(Future(true))
    when(workflowRepository.existsWorkflowWithPrefix(eqTo(notificationRule.workflowPrefix.get))(any[ExecutionContext]))
      .thenReturn(Future(false))

    // when
    underTest.validate(notificationRule).failed.map { error =>
      val result = error.asInstanceOf[ApiException]
      // then
      result.apiErrors should have size 1
      result.apiErrors.head shouldBe ValidationError(
        s"No workflow with prefix ${notificationRule.workflowPrefix.get} exists"
      )
    }
  }

  it should "fail if any email address is invalid" in {
    // given
    val notificationRule = createNotificationRule().copy(recipients = Seq("abc@xyz.com", "abc@com", "abc.def.ghi"))
    when(workflowRepository.existsProject(eqTo(notificationRule.project.get))(any[ExecutionContext]))
      .thenReturn(Future(true))
    when(workflowRepository.existsWorkflowWithPrefix(eqTo(notificationRule.workflowPrefix.get))(any[ExecutionContext]))
      .thenReturn(Future(true))

    // when
    underTest.validate(notificationRule).failed.map { error =>
      val result = error.asInstanceOf[ApiException]
      // then
      result.apiErrors should have size 2
      result.apiErrors should contain theSameElementsAs Seq(
        ValidationError(s"Recipient abc@com is not a valid e-mail address"),
        ValidationError(s"Recipient abc.def.ghi is not a valid e-mail address")
      )
    }
  }

  it should "fail if minElapsedSeconds is < 0" in {
    // given
    val notificationRule = createNotificationRule().copy(minElapsedSecondsSinceLastSuccess = Some(-1))
    when(workflowRepository.existsProject(eqTo(notificationRule.project.get))(any[ExecutionContext]))
      .thenReturn(Future(true))
    when(workflowRepository.existsWorkflowWithPrefix(eqTo(notificationRule.workflowPrefix.get))(any[ExecutionContext]))
      .thenReturn(Future(true))

    // when
    underTest.validate(notificationRule).failed.map { error =>
      val result = error.asInstanceOf[ApiException]
      // then
      result.apiErrors should have size 1
      result.apiErrors.head.message shouldBe "Min elapsed seconds since last success cannot be negative, is -1"
    }
  }

  it should "return all validation errors" in {
    // given
    val notificationRule = createNotificationRule().copy(recipients = Seq("abc@com"))
    when(workflowRepository.existsProject(eqTo(notificationRule.project.get))(any[ExecutionContext]))
      .thenReturn(Future(false))
    when(workflowRepository.existsWorkflowWithPrefix(eqTo(notificationRule.workflowPrefix.get))(any[ExecutionContext]))
      .thenReturn(Future(false))

    // when
    underTest.validate(notificationRule).failed.map { error =>
      val result = error.asInstanceOf[ApiException]
      // then
      result.apiErrors should have size 3
      result.apiErrors should contain theSameElementsAs Seq(
        ValidationError(s"No workflow with prefix ${notificationRule.workflowPrefix.get} exists"),
        ValidationError(s"No project with name ${notificationRule.project.get} exists"),
        ValidationError(s"Recipient abc@com is not a valid e-mail address")
      )
    }
  }

  private def createNotificationRule() =
    NotificationRule(
      true,
      Some("project"),
      Some("ABC XYZ"),
      None,
      Seq(DagInstanceStatuses.Skipped, DagInstanceStatuses.Failed),
      Seq("abc.def@ghi.com"),
      updated = None
    )

}
