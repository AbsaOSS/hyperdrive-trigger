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

import {Action} from "@ngrx/store";
import {ProjectModel} from "../../models/project.model";
import {WorkflowModel} from "../../models/workflow.model";
import {WorkflowJoinedModel} from "../../models/workflowJoined.model";
import {WorkflowFormPartsModel} from "../../models/workflowFormParts.model";
import {WorkflowEntryModel} from "../../models/workflowEntry.model";
import {JobEntryModel} from "../../models/jobEntry.model";

export const INITIALIZE_WORKFLOWS = 'INITIALIZE_WORKFLOWS';
export const INITIALIZE_WORKFLOWS_SUCCESS = 'INITIALIZE_WORKFLOWS_SUCCESS';
export const INITIALIZE_WORKFLOWS_FAILURE = 'INITIALIZE_WORKFLOWS_FAILURE';

export const STAR_WORKFLOW_INITIALIZATION = 'STAR_WORKFLOW_INITIALIZATION';
export const SET_EMPTY_WORKFLOW = 'SET_EMPTY_WORKFLOW';
export const LOAD_WORKFLOW_SUCCESS = 'LOAD_WORKFLOW_SUCCESS';
export const LOAD_WORKFLOW_FAILURE_INCORRECT_ID = 'LOAD_WORKFLOW_FAILURE_INCORRECT_ID';
export const LOAD_WORKFLOW_FAILURE = 'LOAD_WORKFLOW_FAILURE';

export const WORKFLOW_ACTION_CHANGED = 'WORKFLOW_ACTION_CHANGED';
export const WORKFLOW_DETAILS_CHANGED = 'WORKFLOW_DETAILS_CHANGED';
export const WORKFLOW_SENSOR_CHANGED = 'WORKFLOW_SENSOR_CHANGED';
export const WORKFLOW_SENSOR_CLEANED = 'WORKFLOW_SENSOR_CLEANED';
export const WORKFLOW_ADD_EMPTY_JOB = 'WORKFLOW_ADD_EMPTY_JOB';
export const WORKFLOW_JOB_CHANGED = 'WORKFLOW_JOB_CHANGED';
export const WORKFLOW_JOB_CLEANED = 'WORKFLOW_JOB_CLEANED';

export class InitializeWorkflows implements Action {
  readonly type = INITIALIZE_WORKFLOWS;
}

export class InitializeWorkflowsSuccess implements Action {
  readonly type = INITIALIZE_WORKFLOWS_SUCCESS;
  constructor(public payload: {projects: ProjectModel[], workflows: WorkflowModel[], workflowFormParts: WorkflowFormPartsModel}) {}
}

export class InitializeWorkflowsFailure implements Action {
  readonly type = INITIALIZE_WORKFLOWS_FAILURE;
}

export class StartWorkflowInitialization implements Action {
  readonly type = STAR_WORKFLOW_INITIALIZATION;
  constructor(public payload: {id?: number, mode: string}) {}
}

export class SetEmptyWorkflow implements Action {
  readonly type = SET_EMPTY_WORKFLOW;
}

export class LoadWorkflowSuccess implements Action {
  readonly type = LOAD_WORKFLOW_SUCCESS;
  constructor(public payload: {
    workflow: WorkflowJoinedModel,
    detailsData: WorkflowEntryModel[],
    sensorData: WorkflowEntryModel[],
    jobsData: JobEntryModel[]
  }) {}
}

export class LoadWorkflowFailure implements Action {
  readonly type = LOAD_WORKFLOW_FAILURE;
}

export class LoadWorkflowFailureIncorrectId implements Action {
  readonly type = LOAD_WORKFLOW_FAILURE_INCORRECT_ID;
}

export class WorkflowActionChanged implements Action {
  readonly type = WORKFLOW_ACTION_CHANGED;
  constructor(public payload: WorkflowJoinedModel) {}
}

export class WorkflowDetailsChanged implements Action {
  readonly type = WORKFLOW_DETAILS_CHANGED;
  constructor(public payload: WorkflowEntryModel) {}
}

export class WorkflowSensorChanged implements Action {
  readonly type = WORKFLOW_SENSOR_CHANGED;
  constructor(public payload: WorkflowEntryModel) {}
}

export class WorkflowSensorCleaned implements Action {
  readonly type = WORKFLOW_SENSOR_CLEANED;
  constructor(public payload: WorkflowEntryModel) {}
}

export class WorkflowAddEmptyJob implements Action {
  readonly type = WORKFLOW_ADD_EMPTY_JOB;
  constructor(public payload: number) {}
}

export class WorkflowJobChanged implements Action {
  readonly type = WORKFLOW_JOB_CHANGED;
  constructor(public payload: {order: number, jobEntry: WorkflowEntryModel}) {}
}

export class WorkflowJobCleaned implements Action {
  readonly type = WORKFLOW_JOB_CLEANED;
  constructor(public payload: {order: number, jobEntry: WorkflowEntryModel}) {}
}

export type WorkflowsActions =
    InitializeWorkflows | InitializeWorkflowsSuccess | InitializeWorkflowsFailure |
    StartWorkflowInitialization | SetEmptyWorkflow | LoadWorkflowSuccess | LoadWorkflowFailure | LoadWorkflowFailureIncorrectId |
    WorkflowActionChanged | WorkflowDetailsChanged | WorkflowSensorChanged | WorkflowSensorCleaned |
    WorkflowAddEmptyJob | WorkflowJobChanged | WorkflowJobCleaned;
