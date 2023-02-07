
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

package za.co.absa.hyperdrive.trigger.api.rest.utils

import org.scalatest.{FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.api.rest.utils.ScalaUtil.swap

import scala.util.{Failure, Success}

class ScalaUtilTest extends FlatSpec with Matchers {
  "swap" should "swap Option[Try] to Try[Option]" in {
    val ex = new RuntimeException("Failed")
    val someSuccess = Some(Success(42))
    val someFailure = Some(Failure(ex))
    val none = None

    swap(someSuccess) shouldBe Success(Some(42))
    swap(someFailure) shouldBe Failure(ex)
    swap(none) shouldBe Success(None)
  }

}
