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

import za.co.absa.hyperdrive.trigger.models.errors.{ApiError, ApiException}

import scala.concurrent.{ExecutionContext, Future}

object ValidationServiceUtil {
  def reduce(validators: Seq[Future[Seq[ApiError]]])(implicit ec: ExecutionContext): Future[Unit] =
    Future
      .reduceLeft(validators.toList)(_ ++ _)
      .transform(apiErrors => if (apiErrors.nonEmpty) throw new ApiException(apiErrors), identity)
}
