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
import { JobEntryModel } from './jobEntry.model';
import set from 'lodash-es/set';
import { WorkflowJoinedModel, WorkflowJoinedModelFactory } from './workflowJoined.model';
import { SensorModel, SensorModelFactory } from './sensor.model';
import { DagDefinitionJoinedModel, DagDefinitionJoinedModelFactory } from './dagDefinitionJoined.model';
import { JobDefinitionModelFactory } from './jobDefinition.model';
import { workflowFormParts } from '../constants/workflowFormParts.constants';
import { JobTemplateModel } from './jobTemplate.model';

class WorkflowDetails {
  constructor(
    public name?: string,
    public isActive?: boolean,
    public project?: string,
    public created?: Date,
    public id?: number,
    public updated?: Date,
  ) {}
}

export class WorkflowRequestModel {
  constructor(
    public detailsData: WorkflowEntryModel[],
    public sensorData: WorkflowEntryModel[],
    public jobsData: JobEntryModel[],
    public jobTemplates: JobTemplateModel[],
  ) {}

  getCreateWorkflowRequestObject(): WorkflowJoinedModel {
    return this.createWorkflowRequestObject();
  }

  getUpdateWorkflowRequestObject(id: number): WorkflowJoinedModel {
    return this.createWorkflowRequestObject(id);
  }

  private createWorkflowRequestObject(id = 0): WorkflowJoinedModel {
    const workflowDetails = this.getWorkflowDetails(id);
    const workflowSensor = this.getWorkflowSensor();
    const workflowDagDefinition = this.getWorkflowDagDefinition();

    return WorkflowJoinedModelFactory.create(
      workflowDetails.name,
      workflowDetails.isActive,
      workflowDetails.project,
      workflowDetails.created,
      workflowSensor,
      workflowDagDefinition,
      workflowDetails.id,
      workflowDetails.updated,
    );
  }

  private getWorkflowDetails(id = 0): WorkflowDetails {
    const workflowDetails = new WorkflowDetails();
    this.detailsData.forEach((detail: WorkflowEntryModel) => {
      set(workflowDetails, detail.property, detail.value);
    });
    workflowDetails.id = id;
    return workflowDetails;
  }

  private getWorkflowSensor(): SensorModel {
    const partialSensor = SensorModelFactory.createEmpty();
    this.sensorData.forEach((sensor) => {
      set(partialSensor, sensor.property, sensor.value);
    });
    return partialSensor;
  }

  private getWorkflowDagDefinition(): DagDefinitionJoinedModel {
    const jobDefinitions = this.jobsData.map((jobDef) => {
      const partialJobDefinition = JobDefinitionModelFactory.createEmpty();
      partialJobDefinition.order = jobDef.order;
      jobDef.entries.forEach((jobProp) => {
        if (workflowFormParts.JOB.JOB_TEMPLATE_ID.property == jobProp.property) {
          const template: JobTemplateModel = this.jobTemplates.find((element) => element.id.toString() == jobProp.value);
          set(partialJobDefinition, 'jobParameters.formConfig', template.formConfig);
          set(partialJobDefinition, jobProp.property, jobProp.value);
        } else {
          set(partialJobDefinition, jobProp.property, jobProp.value);
        }
      });
      return partialJobDefinition;
    });
    return DagDefinitionJoinedModelFactory.create(0, jobDefinitions, 0);
  }
}
