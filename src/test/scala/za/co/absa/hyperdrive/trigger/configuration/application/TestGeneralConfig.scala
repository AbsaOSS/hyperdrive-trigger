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

package za.co.absa.hyperdrive.trigger.configuration.application

object TestGeneralConfig {
  def apply(
    maximumNumberOfWorkflowsInBulkRun: Int = 10,
    environment: String = "Unknown",
    version: String = "Unknown",
    appUniqueId: String = "20e3f97d-88ac-453c-9524-0166e2c221c5",
    kafkaConsumersCacheSize: Int = 50
  ): GeneralConfig =
    new GeneralConfig(maximumNumberOfWorkflowsInBulkRun, environment, version, appUniqueId, kafkaConsumersCacheSize)
}
