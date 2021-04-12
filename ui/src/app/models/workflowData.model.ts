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

import { WorkflowEntryModel, WorkflowEntryModelFactory } from './workflowEntry.model';
import { WorkflowJoinedModel } from './workflowJoined.model';
import { workflowFormParts as workflowFormPartsConsts, workflowFormPartsSequences } from '../constants/workflowFormParts.constants';
import get from 'lodash-es/get';
import { JobEntryModel, JobEntryModelFactory } from './jobEntry.model';
import { DynamicFormParts } from './workflowFormParts.model';
import { WorkflowFormDataModel, WorkflowFormDataModelFactory } from './workflowFormData.model';

export class WorkflowDataModel {
  constructor(private worfklow: WorkflowJoinedModel, private dynamicParts: DynamicFormParts) {}

  getWorkflowFromData(): WorkflowFormDataModel {
    return WorkflowFormDataModelFactory.create(this.getDetailsData(), this.getSensorData(), this.getJobsData());
  }

  getDetailsData(): WorkflowEntryModel[] {
    return workflowFormPartsSequences.allDetails.map((detail) => {
      const value = get(this.worfklow, detail.property);
      if (value != undefined) {
        return WorkflowEntryModelFactory.create(detail.property, value);
      }
    });
  }

  getSensorData(): WorkflowEntryModel[] {
    const sensorType = workflowFormPartsConsts.SENSOR.SENSOR_TYPE;
    const sensorTypeValue = get(this.worfklow.sensor, sensorType.property);
    const sensorDynamicOption = this.dynamicParts.sensorDynamicParts.find((part) => part.value == sensorTypeValue);
    const sensorDynamicParts = sensorDynamicOption == undefined ? [] : sensorDynamicOption.parts;
    return sensorDynamicParts.concat(sensorType).map((part) => {
      const value = get(this.worfklow.sensor, part.property);
      return WorkflowEntryModelFactory.create(part.property, value);
    });
  }

  getJobsData(): JobEntryModel[] {
    const jobsData = this.worfklow.dagDefinitionJoined.jobDefinitions.map((job) => {
      const jobStaticPart = workflowFormPartsConsts.JOB.JOB_NAME;
      const jobDynamicPart = workflowFormPartsConsts.JOB.JOB_TEMPLATE_ID;
      const jobDynamicPartValue = get(job, jobDynamicPart.property);
      const jobDynamicOption = this.dynamicParts.jobDynamicParts.find((part) => part.value == jobDynamicPartValue);
      const jobDynamicParts = jobDynamicOption == undefined ? [] : jobDynamicOption.parts;
      const jobData = jobDynamicParts.concat(jobDynamicPart, jobStaticPart).map((part) => {
        const value = get(job, part.property);
        return WorkflowEntryModelFactory.create(part.property, value);
      });
      return JobEntryModelFactory.createWithUuid(job.order, jobData);
    });
    return jobsData;
  }
}
