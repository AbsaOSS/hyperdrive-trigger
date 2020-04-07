/*
 * Copyright 2018 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the 'License");
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

import * as WorkflowsActions from '../workflows/workflows.actions';
import {ProjectModel} from '../../models/project.model';
import {WorkflowModel} from '../../models/workflow.model';

export interface State {
  projects: ProjectModel[];
  workflows: WorkflowModel[];
  loading: boolean;
}

const initialState: State = {
  projects: [],
  workflows: [],
  loading: true
};

export function workflowsReducer(state: State = initialState, action: WorkflowsActions.WorkflowsActions) {
  switch (action.type) {
    case (WorkflowsActions.INITIALIZE_WORKFLOWS):
      return {...state, loading: true};
    case (WorkflowsActions.INITIALIZE_WORKFLOWS_SUCCESS):
      return {...state, loading: false, projects: action.payload.projects, workflows: action.payload.workflows};
    case (WorkflowsActions.INITIALIZE_WORKFLOWS_FAILURE):
      return {...initialState, loading: false};
    default:
      return state;
  }
}
