
/*
 * Copyright 2018 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicablea law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package za.co.absa.hyperdrive.trigger

import java.util.concurrent.TimeUnit

import scala.concurrent.{Await, Future}
import scala.concurrent.duration.Duration

object TestUtils {
  def await[T](future: Future[T]): T = {
    Await.result(future, Duration(120, TimeUnit.SECONDS))
  }
}
