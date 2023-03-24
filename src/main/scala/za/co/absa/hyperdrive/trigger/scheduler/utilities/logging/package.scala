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
package za.co.absa.hyperdrive.trigger.scheduler.utilities

package object logging {

  /**
   *  Execute arbitrary side effect for provided element.
   *
   *  {{{
   *   List(1, 2, 3, 4).map(wireTap(id => logger.info("Element is {}", id))
   *  }}}
   *
   *  @param sideEffect executed on received element.
   *  @param elm provided element, e.g. from Functor#map
   *  @tparam A type of element
   *  @tparam U unit result type, i.e. type that will be dropped.
   *  @return original element
   */
  def wireTap[A, U](sideEffect: A => U)(elm: A): A = {
    sideEffect(elm)
    elm
  }
}
