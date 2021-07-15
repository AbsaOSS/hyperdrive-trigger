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

import { JobType } from './jobType.model';
import { JobTemplateParameters } from './jobTemplateParameters.model';

export type JobTemplateModel = {
  id: number;
  name: string;
  formConfig: string;
  jobParameters: JobTemplateParameters;
};

export class JobTemplateModelFactory {
  static create(id: number, name: string, formConfig: string, jobType: JobType, jobParameters: JobTemplateParameters): JobTemplateModel {
    return { id: id, name: name, formConfig: formConfig, jobParameters: jobParameters };
  }
}
