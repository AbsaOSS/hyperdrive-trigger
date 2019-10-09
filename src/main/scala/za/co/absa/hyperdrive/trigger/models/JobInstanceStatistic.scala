/*
 * Copyright 2018-2019 ABSA Group Limited
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

case class OverallStatistics(
  successful: Int,
  failed: Int,
  running: Int,
  queued: Int
)

case class PerWorkflowStatistics(
  workflowId: Long,
  workflowName: String,
  isActive: Boolean,
  total: Int,
  successful: Int,
  failed: Int,
  queued: Int,
  running: Int
)

case class PerDagStatistics(
  dagId: Long,
  total: Int,
  successful: Int,
  failed: Int,
  queued: Int,
  running: Int
)

case class PerProjectStatistics(
  projectName: String,
  total: Int,
  successful: Int,
  failed: Int,
  queued: Int,
  running: Int
)