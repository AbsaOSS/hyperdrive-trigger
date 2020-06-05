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

export type SensorModel = {
  workflowId: number;
  sensorType: SensorType;
  properties: PropertiesModel;
  id: number;
};

export type SensorType = {
  name: string;
};

export type PropertiesModel = {
  sensorId: number;
  settings: SettingsModel;
  matchProperties: Map<string, string>;
};

export type SettingsModel = {
  variables: Map<string, string>;
  maps: Map<string, Set<string>>;
};

export class SettingsModelFactory {
  static create(variables: Map<string, string>, maps: Map<string, Set<string>>): SettingsModel {
    return { variables: variables, maps: maps };
  }

  static createEmpty(): SettingsModel {
    return this.create(new Map<string, string>(), new Map<string, Set<string>>());
  }
}

export class PropertiesModelFactory {
  static create(sensorId: number, settings: SettingsModel, matchProperties: Map<string, string>): PropertiesModel {
    return { sensorId: sensorId, settings: settings, matchProperties: matchProperties };
  }

  static createEmpty(): PropertiesModel {
    return this.create(undefined, SettingsModelFactory.createEmpty(), new Map<string, string>());
  }
}

export class SensorTypeFactory {
  static create(name: string): SensorType {
    return { name: name };
  }

  static createEmpty(): SensorType {
    return this.create(undefined);
  }
}

export class SensorModelFactory {
  static create(workflowId: number, sensorType: SensorType, properties: PropertiesModel, id: number): SensorModel {
    return { workflowId: workflowId, sensorType: sensorType, properties: properties, id: id };
  }

  static createEmpty(): SensorModel {
    return this.create(undefined, SensorTypeFactory.createEmpty(), PropertiesModelFactory.createEmpty(), undefined);
  }
}
