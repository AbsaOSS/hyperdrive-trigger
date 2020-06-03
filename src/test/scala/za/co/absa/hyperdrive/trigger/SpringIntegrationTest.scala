
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

package za.co.absa.hyperdrive.trigger

import org.junit.runner.RunWith
import org.scalatest.{BeforeAndAfterAll, Suite}
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.TestContextManager
import org.springframework.test.context.junit4.SpringRunner

@SpringBootTest
@RunWith(classOf[SpringRunner])
trait SpringIntegrationTest extends BeforeAndAfterAll { this: Suite =>
  override def beforeAll(): Unit = {
    new TestContextManager(classOf[SpringIntegrationTest]).prepareTestInstance(this)
    super.beforeAll()
  }
}
