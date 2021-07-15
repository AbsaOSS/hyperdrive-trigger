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

import { FormConfig, FormConfigFactory } from './formConfig.model';

export interface JobDefinitionParameters {
  formConfig: FormConfig;
}

export class SparkDefinitionParametersModel implements JobDefinitionParameters {
  formConfig: FormConfig;
  appArguments: Set<string>;
  additionalJars: Set<string>;
  additionalFiles: Set<string>;
  additionalSparkConfig: Map<string, string>;
  jobJar?: string;
  mainClass?: string;

  static createEmpty(): SparkDefinitionParametersModel {
    return {
      formConfig: FormConfigFactory.create('Spark'),
      appArguments: new Set(),
      additionalJars: new Set(),
      additionalFiles: new Set(),
      additionalSparkConfig: new Map(),
    };
  }
}

export class HyperdriveDefinitionParametersModel implements JobDefinitionParameters {
  formConfig: FormConfig;
  appArguments: Set<string>;
  additionalJars: Set<string>;
  additionalFiles: Set<string>;
  additionalSparkConfig: Map<string, string>;

  static createEmpty(): HyperdriveDefinitionParametersModel {
    return {
      formConfig: FormConfigFactory.create('Hyperdrive'),
      appArguments: new Set(),
      additionalJars: new Set(),
      additionalFiles: new Set(),
      additionalSparkConfig: new Map(),
    };
  }
}

export class ShellDefinitionParametersModel implements JobDefinitionParameters {
  formConfig: FormConfig;
  scriptLocation?: string;

  static createEmpty(): ShellDefinitionParametersModel {
    return { formConfig: FormConfigFactory.create('Shell'), scriptLocation: null };
  }
}
