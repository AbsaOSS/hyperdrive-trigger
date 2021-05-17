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

import org.scalatest.mockito.MockitoSugar.mock
import org.scalatest.{FlatSpec, _}
import za.co.absa.hyperdrive.trigger.models.NotificationRule
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses

import scala.concurrent.ExecutionContext.Implicits.global

class NotificationRuleRepositoryTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with RepositoryTestBase {
  import api._

  val notificationRuleRepositoryMock: NotificationRuleHistoryRepository = mock[NotificationRuleHistoryRepository]
  val notificationRuleRepository: NotificationRuleRepository = new NotificationRuleRepositoryImpl(notificationRuleRepositoryMock) with H2Profile
  { override val profile = h2Profile }

  override def beforeAll: Unit = {
    h2SchemaSetup()
  }

  override def afterAll: Unit = {
    h2SchemaDrop()
  }

  override def beforeEach: Unit = {
//    run(notificationRuleTable.forceInsertAll(TestData.notificationRules))
  }

  override def afterEach: Unit = {
    clearData()
  }
//  def insertNotificationRule(notificationRule: NotificationRule, user: String)(implicit ec: ExecutionContext): Future[Long]
//  def getNotificationRule(id: Long)(implicit ec: ExecutionContext): Future[NotificationRule]
//  def getNotificationRules()(implicit ec: ExecutionContext): Future[Seq[NotificationRule]]
//  def updateNotificationRule(notificationRule: NotificationRule, user: String)(implicit ec: ExecutionContext): Future[Unit]
//  def deleteNotificationRule(id: Long, user: String)(implicit ec: ExecutionContext): Future[Unit]
//  def searchNotificationRules(tableSearchRequest: TableSearchRequest)(implicit ec: ExecutionContext): Future[TableSearchResponse[NotificationRule]]

  "insertNotificationRule" should "insert a notification rule" in {
    val expected = NotificationRule(Some("project"), Some("ABC XYZ"), None, Seq(DagInstanceStatuses.Succeeded),
      Seq("abc@xyz.com", "def@xyz.com"), updated = None, id = 11L)

    val id: Long = await(notificationRuleRepository.insertNotificationRule(expected, "test-user"))
    val allRules = await(notificationRuleRepository.getNotificationRules())

    allRules.size == 1
    val actual = allRules.head
    actual.id shouldBe id
    actual.project shouldBe expected.project
    actual.workflowPrefix shouldBe expected.workflowPrefix
    actual.minElapsedSecondsSinceLastSuccess shouldBe expected.minElapsedSecondsSinceLastSuccess
    actual.recipients shouldBe expected.recipients
    actual.updated shouldBe None

    val actualHistoryEntries = await(db.run(notificationRuleHistoryTable.result))
    actualHistoryEntries should have size 1
    actualHistoryEntries.head.notificationRuleId shouldBe id
    actualHistoryEntries.head.history.changedBy shouldBe "test-user"
  }

  it should "throw an ApiException if the insert fails" in {

  }

  "getNotificationRule" should "get a single notification rule" in {

  }

  "getNotificationRules" should "asdf" in {

  }
}
