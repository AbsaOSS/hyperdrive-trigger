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

import org.scalatest.{BeforeAndAfterAll, BeforeAndAfterEach, FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses._
import za.co.absa.hyperdrive.trigger.models.{DagInstance, NotificationRule, Workflow}

import java.time.LocalDateTime
import scala.concurrent.ExecutionContext.Implicits.global
import org.scalatest.OptionValues

class NotificationRuleRepositoryPostgresTest extends FlatSpec with Matchers with BeforeAndAfterAll
  with BeforeAndAfterEach with RepositoryPostgresTestBase with OptionValues {

  import api._

  private val notificationRuleHistoryRepository: NotificationRuleHistoryRepository =
    new NotificationRuleHistoryRepositoryImpl(dbProvider)

  private val notificationRuleRepository: NotificationRuleRepository =
    new NotificationRuleRepositoryImpl(dbProvider, notificationRuleHistoryRepository)

  override def beforeAll(): Unit = {
    super.beforeAll()
    schemaSetup()
  }

  override def afterAll: Unit = {
    schemaDrop()
  }

  override def afterEach: Unit = {
    clearData()
  }

  "getMatchingNotificationRules" should "return rules matching the project name" in {
    val workflowId = 1L
    val w1 = Workflow(name = "workflow1", isActive = true, project = "project1", created = LocalDateTime.now(), updated = None, id = workflowId)
    val nr = createDummyNotificationRule()
    val nr10 = nr.copy(project = Some("PROJECT1"), id = 10L)
    val nr11 = nr.copy(project = Some("project1"), id = 11L)
    val nr12 = nr.copy(project = Some(""), id = 12L)
    val nr13 = nr.copy(project = None, id = 13L)
    val nr20 = nr.copy(project = Some("project"), id = 20L)

    await(db.run(workflowTable.forceInsert(w1)))
    await(db.run(notificationRuleTable.forceInsertAll(Seq(nr10, nr11, nr12, nr13, nr20))))

    val result = await(notificationRuleRepository.getMatchingNotificationRules(workflowId, Failed, LocalDateTime.now()))
    result.value._1 should contain theSameElementsAs Seq(nr10, nr11, nr12, nr13)
    result.value._2 shouldBe w1
  }

  it should "not fail when there are no matching rules" in {
    val result = await(notificationRuleRepository.getMatchingNotificationRules(42L, InQueue, LocalDateTime.now()))
    result shouldBe None
  }

  it should "return rules matching the workflow name" in {
    val workflowId = 1L
    val w1 = Workflow(name = "workflow1", isActive = true, project = "project1", created = LocalDateTime.now(), updated = None, id = workflowId)
    val nr = createDummyNotificationRule()
    val nr10 = nr.copy(workflowPrefix = Some("WORK"), id = 10L)
    val nr11 = nr.copy(workflowPrefix = Some("workflow1"), id = 11L)
    val nr12 = nr.copy(workflowPrefix = Some(""), id = 12L)
    val nr13 = nr.copy(workflowPrefix = None, id = 13L)
    val nr20 = nr.copy(workflowPrefix = Some("flow1"), id = 20L)

    await(db.run(workflowTable.forceInsert(w1)))
    await(db.run(notificationRuleTable.forceInsertAll(Seq(nr10, nr11, nr12, nr13, nr20))))

    val result = await(notificationRuleRepository.getMatchingNotificationRules(workflowId, Failed, LocalDateTime.now()))
    result.value._1 should contain theSameElementsAs Seq(nr10, nr11, nr12, nr13)
    result.value._2 shouldBe w1
  }

  it should "return rules matching the status" in {
    val workflowId = 1L
    val w1 = Workflow(name = "workflow1", isActive = true, project = "project1", created = LocalDateTime.now(), updated = None, id = workflowId)
    val nr = createDummyNotificationRule()
    val nr10 = nr.copy(statuses = Seq(Failed, Succeeded), id = 10L)
    val nr11 = nr.copy(statuses = Seq(Failed), id = 11L)
    val nr20 = nr.copy(statuses = Seq(), id = 20L)
    val nr21 = nr.copy(statuses = Seq(Succeeded), id = 21L)

    await(db.run(workflowTable.forceInsert(w1)))
    await(db.run(notificationRuleTable.forceInsertAll(Seq(nr10, nr11, nr20, nr21))))

    val result = await(notificationRuleRepository.getMatchingNotificationRules(workflowId, Failed, LocalDateTime.now()))
    result.value._1 should contain theSameElementsAs Seq(nr10, nr11)
    result.value._2 shouldBe w1
  }

  it should "return rules whose threshold for the time since the last success is lower than the actual time since last success" in {
    val currentTime = LocalDateTime.now()
    val workflowId = 1L
    val w1 = Workflow(name = "workflow1", isActive = true, project = "project1", created = LocalDateTime.now(), updated = None, id = workflowId)
    val startedTime = currentTime.minusHours(8)
    val di1 = DagInstance(status = Running, triggeredBy = "user", started = startedTime, finished = None, workflowId = w1.id, id = 202)
    val di2 = DagInstance(status = Succeeded, triggeredBy = "user", started = startedTime, finished = None, workflowId = w1.id, id = 203)
    val di3 = DagInstance(status = Succeeded, triggeredBy = "user", started = startedTime, finished = Some(currentTime.minusMinutes(121)), workflowId = w1.id, id = 204)
    val di4 = DagInstance(status = Failed, triggeredBy = "user", started = startedTime, finished = Some(currentTime), workflowId = w1.id, id = 205)
    val nr = createDummyNotificationRule()
    val nr10 = nr.copy(minElapsedSecondsSinceLastSuccess = Some(2 * 60 * 60), id = 10L)
    val nr11 = nr.copy(minElapsedSecondsSinceLastSuccess = None, id = 11L)
    val nr12 = nr.copy(minElapsedSecondsSinceLastSuccess = Some(-1), id = 12L)
    val nr20 = nr.copy(minElapsedSecondsSinceLastSuccess = Some(3 * 60 * 60), id = 20L)

    await(db.run(workflowTable.forceInsert(w1)))
    await(db.run(dagInstanceTable.forceInsertAll(Seq(di1, di2, di3, di4))))
    await(db.run(notificationRuleTable.forceInsertAll(Seq(nr10, nr11, nr12, nr20))))

    val result = await(notificationRuleRepository.getMatchingNotificationRules(workflowId, Failed, LocalDateTime.now()))
    result.value._1 should contain theSameElementsAs Seq(nr10, nr11, nr12)
    result.value._2 shouldBe w1
  }

  it should "return rules if no dag instances exist yet even if a threshold is set" in {
    val workflowId = 1L
    val w1 = Workflow(name = "workflow1", isActive = true, project = "project1", created = LocalDateTime.now(), updated = None, id = workflowId)
    val nr = createDummyNotificationRule()
    val nr10 = nr.copy(minElapsedSecondsSinceLastSuccess = Some(2 * 60 * 60), id = 10L)
    val nr11 = nr.copy(minElapsedSecondsSinceLastSuccess = None, id = 11L)
    val nr12 = nr.copy(minElapsedSecondsSinceLastSuccess = Some(-1), id = 12L)

    await(db.run(workflowTable.forceInsert(w1)))
    await(db.run(notificationRuleTable.forceInsertAll(Seq(nr10, nr11, nr12))))

    val result = await(notificationRuleRepository.getMatchingNotificationRules(workflowId, Failed, LocalDateTime.now()))
    result.value._1 should contain theSameElementsAs Seq(nr10, nr11, nr12)
    result.value._2 shouldBe w1
  }

  it should "not return any inactive notification rules" in {
    val workflowId = 1L
    val w1 = Workflow(name = "workflow1", isActive = true, project = "project1", created = LocalDateTime.now(), updated = None, id = workflowId)
    val nr = createDummyNotificationRule()
    val nr10 = nr.copy(project = Some("PROJECT1"), id = 10L)
    val nr11 = nr.copy(workflowPrefix = Some("work"), id = 11L)
    val nr20 = nr.copy(isActive = false, project = Some("project1"), id = 20L)
    val nr21 = nr.copy(isActive = false, workflowPrefix = Some("work"), id = 21L)

    await(db.run(workflowTable.forceInsert(w1)))
    await(db.run(notificationRuleTable.forceInsertAll(Seq(nr10, nr11, nr20, nr21))))

    val result = await(notificationRuleRepository.getMatchingNotificationRules(workflowId, Failed, LocalDateTime.now()))
    result.value._1 should contain theSameElementsAs Seq(nr10, nr11)
    result.value._2 shouldBe w1
  }

  private def createDummyNotificationRule() = {
    NotificationRule(isActive = true, None, None, None, Seq(DagInstanceStatuses.Failed), Seq("abc@xyz.com"),
      created = LocalDateTime.now(), updated = None, id = -1L)
  }
}
