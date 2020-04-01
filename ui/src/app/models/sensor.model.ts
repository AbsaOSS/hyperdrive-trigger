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

export class SensorModel {

  constructor(
    // public workflowId: number,
    public sensorType: boolean,
    public properties: PropertiesModel
    // public id: number
  ) {}

}

export class PropertiesModel {

  constructor(
    public settings: SettingsModel,
    public matchProperties: Map<String, String>
  ) {}

}

export class SettingsModel {

  constructor(
    public variables: Map<String, String>,
    public maps: Map<String, Set<String>>
  ) {}

}
