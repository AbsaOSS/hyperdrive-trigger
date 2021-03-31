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
package za.co.absa.hyperdrive.trigger.scheduler.utilities.logging

/**
 * Class deferring computation on toString call.
 *
 * @param value That should be computed only after toString call.
 * @tparam A Type of value computation result
 */
class LazyToStr[A](value: => A) {

  override def toString: String = {
    value match {
      case v: Iterable[_] => s"[${v.map(_.toString).mkString(", ")}]" // Slightly more compact version for logs
      case v => v.toString
    }
  }
}
