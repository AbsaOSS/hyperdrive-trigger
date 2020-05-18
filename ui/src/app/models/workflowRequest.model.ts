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
import { JobEntryModelObject } from './jobEntry.model';
import set from 'lodash/set';

export class WorkflowRequestModel {
  constructor(public detailsData: WorkflowEntryModel[], public sensorData: WorkflowEntryModel[], public jobsData: JobEntryModelObject[]) {}

  getCreateWorkflowRequestObject(): Record<string, any> {
    return this.createWorkflowRequestObject();
  }

  getUpdateWorkflowRequestObject(id: number): Record<string, any> {
    const workflowRequest = this.createWorkflowRequestObject();
    set(workflowRequest, 'id', id);
    return workflowRequest;
  }

  private createWorkflowRequestObject(): Record<string, any> {
    const workflowRequestObject = {};
    this.detailsData.forEach((detail) => {
      set(workflowRequestObject, detail.property, detail.value);
    });

    this.sensorData.forEach((sensor) => {
      set(workflowRequestObject, 'sensor.' + sensor.property, sensor.value);
    });

    this.jobsData.forEach((jobDef) => {
      set(workflowRequestObject, 'dagDefinitionJoined.jobDefinitions[' + jobDef.order + '].order', jobDef.order);
      jobDef.entries.forEach((jobProp) => {
        set(workflowRequestObject, 'dagDefinitionJoined.jobDefinitions[' + jobDef.order + '].' + jobProp.property, jobProp.value);
      });
    });

    return workflowRequestObject;
  }
}
