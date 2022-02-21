
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

package za.co.absa.hyperdrive.trigger.api.rest.controller

import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.api.rest.controllers.UtilController

class UtilControllerTest extends FlatSpec with Matchers with MockitoSugar with BeforeAndAfter {
  private val underTest = new UtilController

  "getQuartzDetail" should "return a human-readable description, incl. month" in {
    // given
    val expression = "0 0 2 2 * ?"

    // when
    val result = underTest.getQuartzDetail(expression)

    // then
    result.expression shouldBe expression
    result.isValid shouldBe true
    result.explained shouldBe "At 02:00, on day 2 of the month"
  }

  it should "return a verbose human-readable description" in {
    // given
    val expression = "0 0/20 * ? * * *"

    // when
    val result = underTest.getQuartzDetail(expression)

    // then
    result.expression shouldBe expression
    result.isValid shouldBe true
    result.explained shouldBe "Every 20 minutes, every hour, every day"
  }

  it should "return an error description if the cron expression is malformed" in {
    // given
    val expression = "0 0 2 2 * MON"

    // when
    val result = underTest.getQuartzDetail(expression)

    // then
    result.expression shouldBe expression
    result.isValid shouldBe false
    result.explained shouldBe "Specifying both a Day of Month and Day of Week is not supported. Either one or the other should be declared as \"?\""
  }

  it should "return an expression itself in description if the cron expression is too complex" in {
    // given
    val expression = "0 22-25,29-32,35-38,50-56,10-20/2 * ? * * *"

    // when
    val result = underTest.getQuartzDetail(expression)

    // then
    result.expression shouldBe expression
    result.isValid shouldBe true
    result.explained shouldBe s"Could not explain the expression: $expression"
  }

}