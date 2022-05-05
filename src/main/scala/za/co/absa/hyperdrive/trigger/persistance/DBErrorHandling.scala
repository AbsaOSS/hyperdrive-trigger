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

import org.slf4j.LoggerFactory
import slick.dbio.{DBIOAction, Effect, NoStream}
import za.co.absa.hyperdrive.trigger.models.errors.{ApiException, GenericDatabaseError}
import za.co.absa.hyperdrive.trigger.models.tables.Profile

import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success}

private[persistance] trait DBErrorHandling {
  this: Profile =>

  private val repositoryLogger = LoggerFactory.getLogger(this.getClass)

  protected implicit class DBIOActionOps[T](val action: api.DBIO[T]) {
    def withErrorHandling(errorMessage: String)(implicit ec: ExecutionContext): DBIOAction[T, NoStream, Effect.All] = {
      action.asTry.map {
        case Success(value) => value
        case Failure(ex: ApiException) => throw ex
        case Failure(ex) =>
          repositoryLogger.error(errorMessage, ex)
          throw new ApiException(GenericDatabaseError)
      }
    }

    def withErrorHandling()(implicit ec: ExecutionContext): DBIOAction[T, NoStream, Effect.All] =
      this.withErrorHandling("Unexpected database error occurred")
  }
}
