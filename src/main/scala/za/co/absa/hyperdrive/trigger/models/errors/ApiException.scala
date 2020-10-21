
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

package za.co.absa.hyperdrive.trigger.models.errors

class ApiException(val apiErrors: Seq[ApiError]) extends RuntimeException {

  def this(apiErrors: Seq[ApiError], cause: Throwable) {
    this(apiErrors)
    initCause(cause)
  }

  def this() {
    this(Seq())
  }

  def this(cause: Throwable) {
    this(Seq(), cause)
  }

  def this(apiError: ApiError) {
    this(Seq(apiError))
  }

  def this(apiError: ApiError, cause: Throwable) {
    this(Seq(apiError), cause)
  }

  override def getMessage: String = {
    apiErrors.map(_.message).reduce(_ + ". " + _)
  }
}