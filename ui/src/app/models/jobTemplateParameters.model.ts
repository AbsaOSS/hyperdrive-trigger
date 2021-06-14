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

import { JobType, JobTypeFactory } from './jobType.model';

export interface JobTemplateParameters {
  jobType: JobType;
}

export class SparkTemplateParametersModel implements JobTemplateParameters {
  jobType: JobType;
  appArguments: Set<string>;
  additionalJars: Set<string>;
  additionalFiles: Set<string>;
  additionalSparkConfig: Map<string, string>;
  jobJar?: string;
  mainClass?: string;

  static createEmpty(): SparkTemplateParametersModel {
    return {
      jobType: JobTypeFactory.create('Spark'),
      appArguments: new Set(),
      additionalJars: new Set(),
      additionalFiles: new Set(),
      additionalSparkConfig: new Map(),
      jobJar: null,
      mainClass: null,
    };
  }
}

export class ShellTemplateParametersModel implements JobTemplateParameters {
  jobType: JobType;
  scriptLocation?: string;

  static createEmpty(): ShellTemplateParametersModel {
    return { jobType: JobTypeFactory.create('Shell'), scriptLocation: null };
  }
}
