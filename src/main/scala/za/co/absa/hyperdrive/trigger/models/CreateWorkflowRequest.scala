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

import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes.SensorType

case class WorkflowJ(
  workflow: Workflow,
  sensor: Sensor,
  jobs: Seq[Job]
)

case class CreateWorkflowRequest(
  name: String,
  isActive: Boolean,
  project: String,
  sensor: CreateSensorRequest,
  dagDefinitionJoined: CreateDagDefinitionJoinedRequest
){}

case class CreateDagDefinitionJoinedRequest(
  jobDefinitions: Seq[CreateJobDefinitionRequest]
)

case class CreateJobDefinitionRequest(
  name: String,
  jobType: JobType,
  jobParameters: CreateJobParametersRequest,
  order: Int
)

case class CreateJobParametersRequest(
  variables: Map[String, String],
  maps: Map[String, Set[String]]
)

case class CreateSensorRequest(
  sensorType: SensorType,
  properties: CreatePropertiesRequest
)

case class CreatePropertiesRequest(
  sensorId: Long,
  settings: CreateSettingsRequest,
  matchProperties: Map[String, String]
)

case class CreateSettingsRequest(
  variables: Map[String, String],
  maps: Map[String, Set[String]]
)