
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

package za.co.absa.hyperdrive.trigger.models

import za.co.absa.hyperdrive.trigger.models.enums.DBOperation.DBOperation

import java.time.LocalDateTime

case class History(
  id: Long = 0,
  changedOn: LocalDateTime,
  changedBy: String,
  operation: DBOperation
)

case class HistoryPair[T](
  leftHistory: T,
  rightHistory: T
)
