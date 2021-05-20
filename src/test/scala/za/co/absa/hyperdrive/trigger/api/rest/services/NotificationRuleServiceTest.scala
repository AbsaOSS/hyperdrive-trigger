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
import za.co.absa.hyperdrive.trigger.models.NotificationRule
import za.co.absa.hyperdrive.trigger.models.enums.{DagInstanceStatuses, JobTypes}
import za.co.absa.hyperdrive.trigger.models.errors.{ApiException, DatabaseError}
import za.co.absa.hyperdrive.trigger.models.search.{TableSearchRequest, TableSearchResponse}
import za.co.absa.hyperdrive.trigger.persistance.{JobTemplateRepository, NotificationRuleRepository}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ExecutionContext, Future}

class NotificationRuleServiceTest extends AsyncFlatSpec with Matchers with MockitoSugar with BeforeAndAfter {
  private val notificationRuleRepository = mock[NotificationRuleRepository]
  private val userName = "some-user"
  private val underTest = new NotificationRuleServiceImpl(notificationRuleRepository){
    override private[services] def getUserName: () => String = () => userName
  }

  before {
    reset(notificationRuleRepository)
  }

  private def createNotificationRule() = {
    NotificationRule(Some("project"), Some("ABC XYZ"), None,
      Seq(DagInstanceStatuses.Skipped, DagInstanceStatuses.Failed),
      Seq("abc.def@ghi.com"), updated = None)
  }


  "createNotificationRule" should "create a notification rule" in {
    // given
    val rule = createNotificationRule()
    when(notificationRuleRepository.insertNotificationRule(eqTo(rule), eqTo(userName))(any[ExecutionContext])).thenReturn(Future{rule.id})

    // when
    val result = await(underTest.createNotificationRule(rule))

    // then
    result shouldBe rule
  }

  "getNotificationRule" should "get a notification rule" in {
    // given
    val rule = createNotificationRule()
    when(notificationRuleRepository.getNotificationRule(eqTo(rule.id))(any[ExecutionContext])).thenReturn(Future{rule})

    // when
    val result = await(underTest.getNotificationRule(rule.id))

    // then
    result shouldBe rule
  }

  "getNotificationRules" should "get notification rules" in {
    // given
    val rule = createNotificationRule()
    val rule2 = rule.copy(id = 42)
    when(notificationRuleRepository.getNotificationRules()(any[ExecutionContext])).thenReturn(Future{Seq(rule, rule2)})

    // when
    val result = await(underTest.getNotificationRules())

    // then
    result should contain theSameElementsAs Seq(rule, rule2)
  }

  "updateNotificationRule" should "update a notification rule" in {
    // given
    val rule = createNotificationRule()
    when(notificationRuleRepository.updateNotificationRule(eqTo(rule), eqTo(userName))(any[ExecutionContext]))
      .thenReturn(Future{(): Unit})

    // when
    val result = await(underTest.updateNotificationRule(rule))

    // then
    result shouldBe rule
  }

  "deleteNotificationRule" should "delete a notification rule" in {
    // given
    val rule = createNotificationRule()
    when(notificationRuleRepository.deleteNotificationRule(eqTo(rule.id), eqTo(userName))(any[ExecutionContext]))
      .thenReturn(Future{(): Unit})

    // when
    val result = await(underTest.deleteNotificationRule(rule.id))

    // then
    result shouldBe true
  }

  "searchNotificationRules" should "return search results" in {
    // given
    val rule = createNotificationRule()
    val rule2 = rule.copy(id = 42)
    val rules = Seq(rule, rule2)
    val searchRequest = TableSearchRequest(sort = None, from = 0, size = 100)
    val searchResponse = TableSearchResponse(items = rules, total = rules.length)

    when(notificationRuleRepository.searchNotificationRules(eqTo(searchRequest))(any[ExecutionContext]))
      .thenReturn(Future{searchResponse})

    // when
    val result = await(underTest.searchNotificationRules(searchRequest))

    // then
    result shouldBe searchResponse
  }
}
