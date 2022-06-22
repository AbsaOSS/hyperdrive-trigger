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

export interface JobTemplateParameters {
  jobType: string;
}

export class SparkTemplateParametersModel implements JobTemplateParameters {
  jobType: string;
  appArguments: string[];
  additionalJars: string[];
  additionalFiles: string[];
  additionalSparkConfig: KeyValueModel[];
  jobJar: string;
  mainClass: string;

  static createEmpty(): SparkTemplateParametersModel {
    return {
      jobType: jobTypes.SPARK,
      appArguments: [],
      additionalJars: [],
      additionalFiles: [],
      additionalSparkConfig: [],
      jobJar: '',
      mainClass: '',
    };
  }
}

export class HyperdriveTemplateParametersModel implements JobTemplateParameters {
  jobType: string;
  appArguments: string[];
  additionalJars: string[];
  additionalFiles: string[];
  additionalSparkConfig: KeyValueModel[];
  jobJar: string;
  mainClass: string;

  static createEmpty(): HyperdriveTemplateParametersModel {
    return {
      jobType: jobTypes.HYPERDRIVE,
      jobJar: '',
      mainClass: '',
      appArguments: [],
      additionalJars: [],
      additionalFiles: [],
      additionalSparkConfig: [],
    };
  }
}

export class ShellTemplateParametersModel implements JobTemplateParameters {
  jobType: string;
  scriptLocation?: string;

  static createEmpty(): ShellTemplateParametersModel {
    return { jobType: jobTypes.SHELL, scriptLocation: '' };
  }
}
