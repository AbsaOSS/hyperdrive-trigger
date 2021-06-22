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

import { JobDefinitionParameters } from './jobDefinitionParameters.model';

export type JobDefinitionModel = {
  dagDefinitionId: number;
  name: string;
  jobTemplateId: string;
  jobParameters: JobDefinitionParameters;
  order: number;
  id: number;
};

export class JobDefinitionModelFactory {
  static create(
    dagDefinitionId = 0,
    name: string,
    jobTemplateId: string,
    jobParameters: JobDefinitionParameters,
    order: number,
    id: number,
  ): JobDefinitionModel {
    return {
      dagDefinitionId: dagDefinitionId,
      name: name,
      jobTemplateId: jobTemplateId,
      jobParameters: jobParameters,
      order: order,
      id: id,
    };
  }

  static createEmpty(): JobDefinitionModel {
    return this.create(undefined, undefined, undefined, undefined, undefined, undefined);
  }
}
