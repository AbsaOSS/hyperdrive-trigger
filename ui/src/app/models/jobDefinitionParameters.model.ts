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

import { jobTypes } from '../constants/jobTypes.constants';
import { KeyValueModel } from './keyValue.model';

export interface JobDefinitionParameters {
  jobType: string;
}

export class SparkDefinitionParametersModel implements JobDefinitionParameters {
  jobType: string;
  appArguments: string[];
  additionalJars: string[];
  additionalFiles: string[];
  additionalSparkConfig: KeyValueModel[];
  jobJar?: string;
  mainClass?: string;

  static createEmpty(): SparkDefinitionParametersModel {
    return {
      jobJar: '',
      mainClass: '',
      jobType: jobTypes.SPARK,
      appArguments: [],
      additionalJars: [],
      additionalFiles: [],
      additionalSparkConfig: [],
    };
  }
}

export class HyperdriveDefinitionParametersModel implements JobDefinitionParameters {
  jobType: string;
  appArguments: string[];
  additionalJars: string[];
  additionalFiles: string[];
  additionalSparkConfig: KeyValueModel[];
  jobJar?: string;
  mainClass?: string;

  static createEmpty(): HyperdriveDefinitionParametersModel {
    return {
      jobJar: '',
      mainClass: '',
      jobType: jobTypes.HYPERDRIVE,
      appArguments: [],
      additionalJars: [],
      additionalFiles: [],
      additionalSparkConfig: [],
    };
  }
}

export class ShellDefinitionParametersModel implements JobDefinitionParameters {
  jobType: string;
  scriptLocation?: string;

  static createEmpty(): ShellDefinitionParametersModel {
    return { jobType: jobTypes.SHELL, scriptLocation: '' };
  }
}
