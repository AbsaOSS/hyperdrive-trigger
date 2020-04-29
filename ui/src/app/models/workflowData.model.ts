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

import {WorkflowEntryModel} from "./workflowEntry.model";
import {WorkflowJoinedModel} from "./workflowJoined.model";
import {
  workflowFormParts as workflowFormPartsConsts,
  workflowFormPartsSequences
} from "../constants/workflowFormParts.constants";
import get from 'lodash/get';
import {JobEntryModel} from "./jobEntry.model";
import {DynamicFormParts} from "./workflowFormParts.model";

export class WorkflowDataModel {
  constructor(
    private worfklow: WorkflowJoinedModel,
    private dynamicParts: DynamicFormParts
  ) {}

  getDetailsData(): WorkflowEntryModel[] {
    return workflowFormPartsSequences.allDetails.map(detail => {
      const value = get(this.worfklow, detail.property);
      if(value != undefined) {
        return new WorkflowEntryModel(detail.property, value);
      }
    });
  }

  getSensorData(): WorkflowEntryModel[] {
    const sensorType = workflowFormPartsConsts.SENSOR.SENSOR_TYPE;
    const sensorTypeValue = get(this.worfklow.sensor, sensorType.property);
    const sensorDynamicParts = this.dynamicParts.sensorDynamicParts.find(
      part => part.name == sensorTypeValue
    ).parts;
    return sensorDynamicParts.concat(sensorType).map(part => {
      const value = get(this.worfklow.sensor, part.property);
      if(value != undefined) {
        return new WorkflowEntryModel(part.property, value);
      }
    });
  }

  getJobsData(): JobEntryModel[] {
    const jobsData = this.worfklow.dagDefinitionJoined.jobDefinitions.map( job => {
      const jobStaticPart = workflowFormPartsConsts.JOB.JOB_NAME;
      const jobDynamicPart = workflowFormPartsConsts.JOB.JOB_TYPE;
      const jobDynamicPartValue = get(job, jobDynamicPart.property);
      const jobDynamicParts = this.dynamicParts.jobDynamicParts.find(
        part => part.name == jobDynamicPartValue
      ).parts;
      const jobData = jobDynamicParts.concat(jobDynamicPart, jobStaticPart).map(part => {
        const value = get(job, part.property);
        if(value != undefined) {
          return new WorkflowEntryModel(part.property, value);
        }
      });
      return new JobEntryModel(job.order, jobData);
    });
    return jobsData;
  }

}
