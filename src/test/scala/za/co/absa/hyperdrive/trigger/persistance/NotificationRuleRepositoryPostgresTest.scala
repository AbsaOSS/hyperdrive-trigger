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
import org.testcontainers.containers.PostgreSQLContainer
import slick.jdbc.PostgresProfile
import za.co.absa.hyperdrive.trigger.models.NotificationRule
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses
import za.co.absa.hyperdrive.trigger.models.errors.{ApiException, GenericDatabaseError}
import za.co.absa.hyperdrive.trigger.models.search.{ContainsFilterAttributes, SortAttributes, TableSearchRequest, TableSearchResponse}

import java.time.LocalDateTime
import scala.concurrent.ExecutionContext.Implicits.global

class NotificationRuleRepositoryPostgresTest extends FlatSpec with Matchers with BeforeAndAfterAll
  with BeforeAndAfterEach with RepositoryTestBaseBase {

  override val profile = PostgresProfile
  import api._

  private val notificationRuleHistoryRepository: NotificationRuleHistoryRepository = new NotificationRuleHistoryRepositoryImpl()

  private val notificationRuleRepository: NotificationRuleRepository = new NotificationRuleRepositoryImpl(notificationRuleHistoryRepository)

  override def beforeAll: Unit = {
    System.setProperty("db.driver", "org.testcontainers.jdbc.ContainerDatabaseDriver")
    System.setProperty("db.url", "jdbc:tc:postgresql:12.7:///test")
    System.setProperty("db.user", "test")
    System.setProperty("db.password", "test")

    new PostgreSQLContainer("postgres:12.7")

    h2SchemaSetup()
  }

  override def afterAll: Unit = {
    h2SchemaDrop()
  }

  override def afterEach: Unit = {
    clearData()
  }
  "searchJobTemplates" should "return notification rules sorted by workflow prefix" in {
    await(db.run(notificationRuleTable.forceInsertAll(Seq(TestData.nr1, TestData.nr2, TestData.nr3))))
    val containsFilterAttributes = Option(Seq(
      ContainsFilterAttributes(field = "project", value = "proj")
    ))
    val searchRequest: TableSearchRequest = TableSearchRequest(
      containsFilterAttributes = containsFilterAttributes,
      sort = Option(SortAttributes(by = "workflowPrefix", order = 1)),
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[NotificationRule] = await(notificationRuleRepository.searchNotificationRules(searchRequest))
    result.total shouldBe TestData.notificationRules.size
    result.items.size shouldBe TestData.notificationRules.size
    result.items should contain theSameElementsInOrderAs Seq(TestData.nr3, TestData.nr1, TestData.nr2)
  }

  it should "return notification rules sorted by ljhlkj" in {
    await(db.run(notificationRuleTable.forceInsertAll(Seq(TestData.nr1, TestData.nr2, TestData.nr3))))

    val result = await(notificationRuleRepository.getMatchingNotificationRules(42L, DagInstanceStatuses.Failed, LocalDateTime.now()))
    println(result)
    result should not be empty
  }
}
