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

package za.co.absa.hyperdrive.trigger.persistance

import org.scalatest.{FlatSpec, _}
import za.co.absa.hyperdrive.trigger.models.NotificationRule
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses
import za.co.absa.hyperdrive.trigger.models.errors.{ApiException, GenericDatabaseError}
import za.co.absa.hyperdrive.trigger.models.search.{ContainsFilterAttributes, SortAttributes, TableSearchRequest, TableSearchResponse}

import scala.concurrent.ExecutionContext.Implicits.global

class NotificationRuleRepositoryTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with RepositoryTestBase {
  import api._
  private val h2NotificationRuleHistoryRepository: NotificationRuleHistoryRepository =
    new NotificationRuleHistoryRepositoryImpl() with H2Profile  {
      override val profile = h2Profile
    }

  private val h2NotificationRuleRepository: NotificationRuleRepository =
    new NotificationRuleRepositoryImpl(h2NotificationRuleHistoryRepository) with H2Profile {
      override val profile = h2Profile
    }

  private val h2NotificationRuleHistoryTable = h2NotificationRuleHistoryRepository.notificationRuleHistoryTable

  private val h2NotificationRuleTable = h2NotificationRuleRepository.notificationRuleTable

  override def beforeAll: Unit = {
    h2SchemaSetup()
  }

  override def afterAll: Unit = {
    h2SchemaDrop()
  }

  override def afterEach: Unit = {
    clearData()
  }

  "insertNotificationRule" should "insert a notification rule" in {
    val expected = TestData.nr1

    val id: Long = await(h2NotificationRuleRepository.insertNotificationRule(expected, "test-user"))
    val allRules = await(db.run(h2NotificationRuleTable.result))

    allRules.size == 1
    val actual = allRules.head
    shouldBeEqualWithoutCreated(actual, expected.copy(id = id))

    val actualHistoryEntries = await(db.run(h2NotificationRuleHistoryTable.result))
    actualHistoryEntries should have size 1
    actualHistoryEntries.head.notificationRuleId shouldBe id
    actualHistoryEntries.head.history.changedBy shouldBe "test-user"
  }

  it should "sort statuses and recipients" in {
    // given
    val rule = NotificationRule(Some("project"), Some("ABC XYZ"), None,
      Seq(DagInstanceStatuses.Skipped, DagInstanceStatuses.Succeeded, DagInstanceStatuses.Failed),
      Seq("def@xyz.com", "ghi@xyz.com", "abc@xyz.com"), updated = None)

    // when
    await(h2NotificationRuleRepository.insertNotificationRule(rule, "test-user"))

    // then
    val insertedRule = await(db.run(h2NotificationRuleTable.result)).head
    insertedRule.statuses should contain theSameElementsInOrderAs Seq(DagInstanceStatuses.Failed, DagInstanceStatuses.Skipped, DagInstanceStatuses.Succeeded)
    insertedRule.recipients should contain theSameElementsInOrderAs Seq("abc@xyz.com", "def@xyz.com", "ghi@xyz.com")
  }

  it should "throw an ApiException if the insert fails" in {
    // given
    val invalidNotificationRule = TestData.nr1.copy(statuses = null)

    // when
    val result = the [ApiException] thrownBy await(h2NotificationRuleRepository.insertNotificationRule(
      invalidNotificationRule, "test-user"))

    // then
    result.apiErrors should contain only GenericDatabaseError
    await(db.run(h2NotificationRuleTable.result)) shouldBe empty
    await(db.run(h2NotificationRuleHistoryTable.result)) shouldBe empty
  }

  "getNotificationRule" should "get a single notification rule" in {
    run(h2NotificationRuleTable.forceInsertAll(TestData.notificationRules))
    val nr1 = await(h2NotificationRuleRepository.getNotificationRule(TestData.nr1.id))
    shouldBeEqualWithoutCreated(nr1, TestData.nr1)
  }

  it should "throw an exception if the notification rule doesn't exist" in {
    val exception = the [ApiException] thrownBy await(h2NotificationRuleRepository.getNotificationRule(42))
    exception.apiErrors should contain only GenericDatabaseError
  }

  "getNotificationRules" should "get all notification rules" in {
    run(h2NotificationRuleTable.forceInsertAll(TestData.notificationRules))
    val allRules = await(h2NotificationRuleRepository.getNotificationRules())
    allRules should contain theSameElementsAs TestData.notificationRules
  }

  it should "return the empty set if no notification rules are found" in {
    val allRules = await(h2NotificationRuleRepository.getNotificationRules())
    allRules shouldBe empty
  }

  "updateNotificationRule" should "update the notification rule" in {
    // given
    val id1 = await(h2NotificationRuleRepository.insertNotificationRule(TestData.nr1, "insert-user"))
    val id2 = await(h2NotificationRuleRepository.insertNotificationRule(TestData.nr2, "insert-user"))
    val nr1 = await(h2NotificationRuleRepository.getNotificationRule(id1))
    val updated = nr1.copy(project = Some("NewProject"))

    // when
    await(h2NotificationRuleRepository.updateNotificationRule(updated, "update-user"))

    // then
    val allRules = await(db.run(h2NotificationRuleTable.result))
    allRules should have size 2
    allRules.map(_.id) should contain theSameElementsAs Seq(id1, id2)
    shouldBeEqualWithoutUpdated(allRules.find(_.id == id1).get, updated)
    shouldBeEqualWithoutCreated(allRules.find(_.id == id2).get, TestData.nr2.copy(id = id2))

    val allHistoryEntries = await(db.run(h2NotificationRuleHistoryTable.result))
    allHistoryEntries should have size 3
    val nr1HistoryEntries = allHistoryEntries.filter(_.notificationRuleId == id1).sortBy(_.history.id)
    nr1HistoryEntries should have size 2
    nr1HistoryEntries.head.history.changedBy shouldBe "insert-user"
    nr1HistoryEntries(1).history.changedBy shouldBe "update-user"
  }

  it should "sort statuses and recipients" in {
    // given
    val rule = NotificationRule(Some("project"), Some("ABC XYZ"), None,
      Seq(DagInstanceStatuses.Succeeded),
      Seq("def@xyz.com"), updated = None)

    await(h2NotificationRuleRepository.insertNotificationRule(rule, "test-user"))
    val insertedRule = await(db.run(h2NotificationRuleTable.result)).head
    val ruleToUpdate = insertedRule.copy(
      statuses = Seq(DagInstanceStatuses.Skipped, DagInstanceStatuses.Succeeded, DagInstanceStatuses.Failed),
      recipients = Seq("def@xyz.com", "ghi@xyz.com", "abc@xyz.com")
    )

    // when
    await(h2NotificationRuleRepository.updateNotificationRule(ruleToUpdate, "update-user"))

    // then
    val updatedRule = await(db.run(h2NotificationRuleTable.result)).head
    updatedRule.statuses should contain theSameElementsInOrderAs Seq(DagInstanceStatuses.Failed, DagInstanceStatuses.Skipped, DagInstanceStatuses.Succeeded)
    updatedRule.recipients should contain theSameElementsInOrderAs Seq("abc@xyz.com", "def@xyz.com", "ghi@xyz.com")
  }

  it should "throw an exception if the notification rule doesn't exist" in {
    val exception = the [ApiException] thrownBy await(h2NotificationRuleRepository.updateNotificationRule(
      TestData.nr1, "update-user"))
    exception.apiErrors should contain only GenericDatabaseError
  }

  "deleteNotificationRule" should "delete the notification rule" in {
    // given
    val id1 = await(h2NotificationRuleRepository.insertNotificationRule(TestData.nr1, "insert-user"))
    val id2 = await(h2NotificationRuleRepository.insertNotificationRule(TestData.nr2, "insert-user"))

    // when
    await(h2NotificationRuleRepository.deleteNotificationRule(id2, "delete-user"))

    // then
    val allRules = await(db.run(h2NotificationRuleTable.result))
    allRules should have size 1
    shouldBeEqualWithoutCreated(allRules.head, TestData.nr1.copy(id = id1))

    val allHistoryEntries = await(db.run(h2NotificationRuleHistoryTable.result))
    allHistoryEntries should have size 3
    val nr2HistoryEntries = allHistoryEntries.filter(_.notificationRuleId == id2).sortBy(_.history.id)
    nr2HistoryEntries should have size 2
    nr2HistoryEntries.head.history.changedBy shouldBe "insert-user"
    nr2HistoryEntries(1).history.changedBy shouldBe "delete-user"
  }

  it should "throw an exception if the notification rule doesn't exist" in {
    val exception = the [ApiException] thrownBy await(h2NotificationRuleRepository.deleteNotificationRule(
      TestData.nr1.id, "delete-user"))
    exception.apiErrors should contain only GenericDatabaseError
  }

  "searchJobTemplates" should "return notification rules sorted by status" in {
    await(db.run(h2NotificationRuleTable.forceInsertAll(Seq(TestData.nr1, TestData.nr2, TestData.nr3))))
    val containsFilterAttributes = Option(Seq(
      ContainsFilterAttributes(field = "project", value = "proj")
    ))
    val searchRequest: TableSearchRequest = TableSearchRequest(
      containsFilterAttributes = containsFilterAttributes,
      sort = Option(SortAttributes(by = "statuses", order = 1)),
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[NotificationRule] = await(h2NotificationRuleRepository.searchNotificationRules(searchRequest))
    result.total shouldBe TestData.notificationRules.size
    result.items.size shouldBe TestData.notificationRules.size
    result.items should contain theSameElementsInOrderAs Seq(TestData.nr2, TestData.nr1, TestData.nr3)
  }

  it should "return notification rules sorted by recipients" in {
    await(db.run(h2NotificationRuleTable.forceInsertAll(Seq(TestData.nr1, TestData.nr2, TestData.nr3))))
    val containsFilterAttributes = Option(Seq(
      ContainsFilterAttributes(field = "project", value = "proj")
    ))
    val searchRequest: TableSearchRequest = TableSearchRequest(
      containsFilterAttributes = containsFilterAttributes,
      sort = Option(SortAttributes(by = "recipients", order = 1)),
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[NotificationRule] = await(h2NotificationRuleRepository.searchNotificationRules(searchRequest))
    result.total shouldBe TestData.notificationRules.size
    result.items.size shouldBe TestData.notificationRules.size
    result.items should contain theSameElementsInOrderAs Seq(TestData.nr1, TestData.nr3, TestData.nr2)
  }

  private def shouldBeEqualWithoutCreated(actual: NotificationRule, expected: NotificationRule) = {
    shouldBeEqualWithoutCreatedAndUpdated(actual, expected)
    actual.updated shouldBe expected.updated
  }

  private def shouldBeEqualWithoutUpdated(actual: NotificationRule, expected: NotificationRule) = {
    shouldBeEqualWithoutCreatedAndUpdated(actual, expected)
    actual.created shouldBe expected.created
  }

  private def shouldBeEqualWithoutCreatedAndUpdated(actual: NotificationRule, expected: NotificationRule) = {
    actual.id shouldBe expected.id
    actual.project shouldBe expected.project
    actual.workflowPrefix shouldBe expected.workflowPrefix
    actual.minElapsedSecondsSinceLastSuccess shouldBe expected.minElapsedSecondsSinceLastSuccess
    actual.recipients shouldBe expected.recipients
  }
}
