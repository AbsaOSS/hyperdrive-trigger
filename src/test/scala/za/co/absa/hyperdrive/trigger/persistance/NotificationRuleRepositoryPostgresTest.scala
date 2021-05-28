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

import org.scalatest.{FlatSpec, Matchers, BeforeAndAfterAll, BeforeAndAfterEach}
import org.testcontainers.containers.PostgreSQLContainer
import slick.jdbc.PostgresProfile
import za.co.absa.hyperdrive.trigger.models.{DagInstance, NotificationRule, Workflow}
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses._
import za.co.absa.hyperdrive.trigger.models.search.{ContainsFilterAttributes, SortAttributes, TableSearchRequest, TableSearchResponse}

import java.time.LocalDateTime
import scala.concurrent.ExecutionContext.Implicits.global

class NotificationRuleRepositoryPostgresTest extends FlatSpec with Matchers with RepositoryPostgresTestBase {

  import api._

  private val notificationRuleHistoryRepository: NotificationRuleHistoryRepository = new NotificationRuleHistoryRepositoryImpl()

  private val notificationRuleRepository: NotificationRuleRepository = new NotificationRuleRepositoryImpl(notificationRuleHistoryRepository)

  "getMatchingNotificationRules" should "return rules matching the project name" in {
    val workflowId = 1L
    val w1 = Workflow(name = "workflow1", isActive = true, project = "project1", created = LocalDateTime.now(), updated = None, id = workflowId)
    val nr = NotificationRule(None, None, None, Seq(Failed), Seq("abc@xyz.com"), created = LocalDateTime.now(), updated = None, id = -1L)
    val nr10 = nr.copy(project = Some("PROJECT1"), id = 10L)
    val nr11 = nr.copy(project = Some("project1"), id = 11L)
    val nr12 = nr.copy(project = Some(""), id = 12L)
    val nr13 = nr.copy(project = None, id = 13L)
    val nr20 = nr.copy(project = Some("project"), id = 20L)

    await(db.run(workflowTable.forceInsert(w1)))
    await(db.run(notificationRuleTable.forceInsertAll(Seq(nr10, nr11, nr12, nr13, nr20))))

    val result = await(notificationRuleRepository.getMatchingNotificationRules(workflowId, Failed, LocalDateTime.now()))
    result should contain theSameElementsAs Seq((nr10, w1), (nr11, w1), (nr12, w1), (nr13, w1))
  }

  it should "return rules matching the workflow name" in {
    val workflowId = 1L
    val w1 = Workflow(name = "workflow1", isActive = true, project = "project1", created = LocalDateTime.now(), updated = None, id = workflowId)
    val nr = NotificationRule(None, Some(""), None, Seq(Failed), Seq("abc@xyz.com"), created = LocalDateTime.now(), updated = None, id = -1L)
    val nr10 = nr.copy(workflowPrefix = Some("WORK"), id = 10L)
    val nr11 = nr.copy(workflowPrefix = Some("workflow1"), id = 11L)
    val nr12 = nr.copy(workflowPrefix = Some(""), id = 12L)
    val nr13 = nr.copy(workflowPrefix = None, id = 13L)
    val nr20 = nr.copy(workflowPrefix = Some("flow1"), id = 20L)

    await(db.run(workflowTable.forceInsert(w1)))
    await(db.run(notificationRuleTable.forceInsertAll(Seq(nr10, nr11, nr12, nr13, nr20))))

    val result = await(notificationRuleRepository.getMatchingNotificationRules(workflowId, Failed, LocalDateTime.now()))
    result should contain theSameElementsAs Seq((nr10, w1), (nr11, w1), (nr12, w1), (nr13, w1))
  }

  it should "return rules matching the status" in {
    val workflowId = 1L
    val w1 = Workflow(name = "workflow1", isActive = true, project = "project1", created = LocalDateTime.now(), updated = None, id = workflowId)
    val nr = NotificationRule(None, None, None, Seq(), Seq("abc@xyz.com"), created = LocalDateTime.now(), updated = None, id = -1L)
    val nr10 = nr.copy(statuses = Seq(Failed, Succeeded), id = 10L)
    val nr11 = nr.copy(statuses = Seq(Failed), id = 11L)
    val nr20 = nr.copy(statuses = Seq(), id = 20L)
    val nr21 = nr.copy(statuses = Seq(Succeeded), id = 21L)

    await(db.run(workflowTable.forceInsert(w1)))
    await(db.run(notificationRuleTable.forceInsertAll(Seq(nr10, nr11, nr20, nr21))))

    val result = await(notificationRuleRepository.getMatchingNotificationRules(workflowId, Failed, LocalDateTime.now()))
    result should contain theSameElementsAs Seq((nr10, w1), (nr11, w1))
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
    val nr = NotificationRule(None, None, None, Seq(Failed), Seq("abc@xyz.com"), created = LocalDateTime.now(), updated = None, id = -1L)
    val nr10 = nr.copy(minElapsedSecondsSinceLastSuccess = Some(2 * 60 * 60), id = 10L)
    val nr11 = nr.copy(minElapsedSecondsSinceLastSuccess = None, id = 11L)
    val nr12 = nr.copy(minElapsedSecondsSinceLastSuccess = Some(-1), id = 12L)
    val nr20 = nr.copy(minElapsedSecondsSinceLastSuccess = Some(3 * 60 * 60), id = 20L)

    await(db.run(workflowTable.forceInsert(w1)))
    await(db.run(dagInstanceTable.forceInsertAll(Seq(di1, di2, di3, di4))))
    await(db.run(notificationRuleTable.forceInsertAll(Seq(nr10, nr11, nr12, nr20))))

    val result = await(notificationRuleRepository.getMatchingNotificationRules(workflowId, Failed, LocalDateTime.now()))
    result should contain theSameElementsAs Seq((nr10, w1), (nr11, w1), (nr12, w1))
  }

  it should "return rules if no dag instances exist yet even if a threshold is set" in {
    val workflowId = 1L
    val w1 = Workflow(name = "workflow1", isActive = true, project = "project1", created = LocalDateTime.now(), updated = None, id = workflowId)
    val nr = NotificationRule(None, None, None, Seq(Failed), Seq("abc@xyz.com"), created = LocalDateTime.now(), updated = None, id = -1L)
    val nr10 = nr.copy(minElapsedSecondsSinceLastSuccess = Some(2 * 60 * 60), id = 10L)
    val nr11 = nr.copy(minElapsedSecondsSinceLastSuccess = None, id = 11L)
    val nr12 = nr.copy(minElapsedSecondsSinceLastSuccess = Some(-1), id = 12L)

    await(db.run(workflowTable.forceInsert(w1)))
    await(db.run(notificationRuleTable.forceInsertAll(Seq(nr10, nr11, nr12))))

    val result = await(notificationRuleRepository.getMatchingNotificationRules(workflowId, Failed, LocalDateTime.now()))
    result should contain theSameElementsAs Seq((nr10, w1), (nr11, w1), (nr12, w1))
  }
}
