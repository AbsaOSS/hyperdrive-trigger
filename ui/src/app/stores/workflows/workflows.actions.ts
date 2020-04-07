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

import {Action} from '@ngrx/store';
import {ProjectModel} from '../../models/project.model';
import {WorkflowModel} from '../../models/workflow.model';

export const INITIALIZE_WORKFLOWS = 'INITIALIZE_WORKFLOWS';
export const INITIALIZE_WORKFLOWS_SUCCESS = 'INITIALIZE_WORKFLOWS_SUCCESS';
export const INITIALIZE_WORKFLOWS_FAILURE = 'INITIALIZE_WORKFLOWS_FAILURE';


export class InitializeWorkflows implements Action {
  readonly type = INITIALIZE_WORKFLOWS;
}

export class InitializeWorkflowsSuccess implements Action {
  readonly type = INITIALIZE_WORKFLOWS_SUCCESS;
  constructor(public payload: {projects: ProjectModel[], workflows: WorkflowModel[]}) {}
}

export class InitializeWorkflowsFailure implements Action {
  readonly type = INITIALIZE_WORKFLOWS_FAILURE;
}

export type WorkflowsActions = InitializeWorkflows | InitializeWorkflowsSuccess | InitializeWorkflowsFailure;
