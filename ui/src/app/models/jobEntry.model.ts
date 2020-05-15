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

import { WorkflowEntryModel } from './workflowEntry.model';
import { UuidUtil } from '../utils/uuid/uuid.util';

export class JobEntryModel {
  private constructor(public readonly jobId: string, public order: number, public entries: WorkflowEntryModel[]) {}

  static createNew(order: number, entries: WorkflowEntryModel[]): JobEntryModel {
    return new JobEntryModel(UuidUtil.createUUID(), order, entries);
  }

  static createAsObject(jobId: string, order: number, entries: WorkflowEntryModel[]): JobEntryModelObject {
    return new JobEntryModel(jobId, order, entries);
  }
}

export type JobEntryModelObject = { jobId: string; order: number; entries: { property: string; value: any }[] };
