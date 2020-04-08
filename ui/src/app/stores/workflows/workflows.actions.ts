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
import {SensorTypesModel} from "../../models/sensorTypes.model";

export const INITIALIZE_WORKFLOWS = 'INITIALIZE_WORKFLOWS';
export const INITIALIZE_WORKFLOWS_SUCCESS = 'INITIALIZE_WORKFLOWS_SUCCESS';
export const INITIALIZE_WORKFLOWS_FAILURE = 'INITIALIZE_WORKFLOWS_FAILURE';

export const STAR_WORKFLOW_INITIALIZATION = 'STAR_WORKFLOW_INITIALIZATION';
export const SET_EMPTY_WORKFLOW = 'SET_EMPTY_WORKFLOW';
export const LOAD_WORKFLOW_SUCCESS = 'LOAD_WORKFLOW_SUCCESS';
export const LOAD_WORKFLOW_FAILURE_INCORRECT_ID = 'LOAD_WORKFLOW_FAILURE_INCORRECT_ID';
export const LOAD_WORKFLOW_FAILURE = 'LOAD_WORKFLOW_FAILURE';

export const WORKFLOW_ACTION_CHANGED = 'WORKFLOW_ACTION_CHANGED';

export class InitializeWorkflows implements Action {
  readonly type = INITIALIZE_WORKFLOWS;
}

export class InitializeWorkflowsSuccess implements Action {
  readonly type = INITIALIZE_WORKFLOWS_SUCCESS;
  constructor(public payload: {projects: ProjectModel[], workflows: WorkflowModel[], sensorTypes: SensorTypesModel}) {}
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
  constructor(public payload: WorkflowJoinedModel) {}
}

export class LoadWorkflowSuccess implements Action {
  readonly type = LOAD_WORKFLOW_SUCCESS;
  constructor(public payload: WorkflowJoinedModel) {}
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

export type WorkflowsActions =
  InitializeWorkflows | InitializeWorkflowsSuccess | InitializeWorkflowsFailure |
  StartWorkflowInitialization | SetEmptyWorkflow | LoadWorkflowSuccess | LoadWorkflowFailure | LoadWorkflowFailureIncorrectId |
  WorkflowActionChanged;
