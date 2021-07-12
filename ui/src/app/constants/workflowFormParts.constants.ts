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

import { FormPartFactory, PartValidationFactory } from '../models/workflowFormParts.model';

export const workflowFormParts = {
  DETAILS: {
    WORKFLOW_NAME: FormPartFactory.create('Workflow name', 'name', 'string-field', PartValidationFactory.create(true, 45, 1)),
    PROJECT_NAME: FormPartFactory.create(
      'Project name',
      'project',
      'string-with-suggestions-field',
      PartValidationFactory.create(true, undefined, 1),
    ),
    IS_ACTIVE: FormPartFactory.create('Is active', 'isActive', 'boolean-field', PartValidationFactory.create(true)),
  },
  SENSOR: {
    SENSOR_TYPE: FormPartFactory.create('Sensor type', 'properties.sensorType', 'select-field', PartValidationFactory.create(true)),
  },
  JOB: {
    JOB_NAME: FormPartFactory.create('Job name', 'name', 'string-field', PartValidationFactory.create(true, undefined, 1)),
    JOB_TEMPLATE_ID: FormPartFactory.create('Job template', 'jobTemplateId', 'select-field', PartValidationFactory.create(true)),
  },
};

export const workflowFormPartsSequences = {
  allDetails: [workflowFormParts.DETAILS.WORKFLOW_NAME, workflowFormParts.DETAILS.PROJECT_NAME, workflowFormParts.DETAILS.IS_ACTIVE],
  allSensors: [workflowFormParts.SENSOR.SENSOR_TYPE],
  allJobs: [workflowFormParts.JOB.JOB_NAME, workflowFormParts.JOB.JOB_TEMPLATE_ID],
};
