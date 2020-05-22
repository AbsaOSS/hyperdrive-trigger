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

import { FormPartFactory } from '../models/workflowFormParts.model';

export const workflowFormParts = {
  DETAILS: {
    WORKFLOW_NAME: FormPartFactory.create('Workflow name', 'name', true, 'string-field'),
    PROJECT_NAME: FormPartFactory.create('Project name', 'project', true, 'string-field'),
    IS_ACTIVE: FormPartFactory.create('Is active', 'isActive', true, 'boolean-field'),
  },
  SENSOR: {
    SENSOR_TYPE: FormPartFactory.create('Sensor type', 'sensorType.name', true, 'select-field'),
  },
  JOB: {
    JOB_NAME: FormPartFactory.create('Job name', 'name', true, 'string-field'),
    JOB_TYPE: FormPartFactory.create('Job type', 'jobType.name', true, 'select-field'),
  },
};

export const workflowFormPartsSequences = {
  allDetails: [workflowFormParts.DETAILS.WORKFLOW_NAME, workflowFormParts.DETAILS.PROJECT_NAME, workflowFormParts.DETAILS.IS_ACTIVE],
  allSensors: [workflowFormParts.SENSOR.SENSOR_TYPE],
  allJobs: [workflowFormParts.JOB.JOB_NAME, workflowFormParts.JOB.JOB_TYPE],
};
