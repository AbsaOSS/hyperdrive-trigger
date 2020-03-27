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

package za.co.absa.hyperdrive.trigger.models.filters

import org.scalatest.{FlatSpec, _}
import za.co.absa.hyperdrive.trigger.models.search.ContainsFilterAttributes

class ContainsFilterTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with FilterTestBase {
  import h2Profile.api._

  behavior of ContainsFilter.getClass.getName

  override def beforeAll: Unit = {
    createSchema()
  }

  override def afterAll: Unit = {
    dropSchema()
  }

  override def afterEach: Unit = {
    dropTable()
  }

  it should "find values that contain the search string" in {
    createFilterTestData()
    val filter = ContainsFilterAttributes(field = FilterTestTableFieldNames.stringField, value = "value")

    val query = filterTestTable.filter(table => table.applyContainsFilter(filter))

    val result = await(db.run(query.result))
    result should not be empty
    result should contain theSameElementsAs FilterTestData.filterTestEntities.filter(_.stringValue.contains("value"))
  }

  it should "not find values that do not contain the search string" in {
    createFilterTestData()
    val filter = ContainsFilterAttributes(field = FilterTestTableFieldNames.stringField, value = "not-matching-string")

    val query = filterTestTable.filter(table => table.applyContainsFilter(filter))

    val result = await(db.run(query.result))
    result shouldBe empty
  }

}
