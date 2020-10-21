
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

import za.co.absa.hyperdrive.trigger.models.WorkflowJoined
import za.co.absa.hyperdrive.trigger.models.errors.ApiErrorTypes._

trait ApiError {
  val message: String
  val errorType: ApiErrorType
  def unwrapError(): ApiError = this
}

case class ValidationError(
  override val message: String,
  override val errorType: ApiErrorType = ValidationErrorType
) extends ApiError

case class DatabaseError(
  override val message: String,
  override val errorType: ApiErrorType = DatabaseErrorType
) extends ApiError

case class GenericError(
  override val message: String,
  override val errorType: ApiErrorType = GenericErrorType
) extends ApiError

case class BulkOperationError(
  workflowIdentifier: String,
  innerError: ApiError
) extends ApiError {
  override val message: String = s"${workflowIdentifier}: ${innerError.message}"
  override val errorType: ApiErrorType = BulkOperationErrorType
  override def unwrapError(): ApiError = innerError
}
object BulkOperationError {
  def apply(workflowJoined: WorkflowJoined, innerError: ApiError): BulkOperationError = {
    BulkOperationError(workflowJoined.name, innerError)
  }
}

object GenericDatabaseError extends DatabaseError("Unexpected error occurred")