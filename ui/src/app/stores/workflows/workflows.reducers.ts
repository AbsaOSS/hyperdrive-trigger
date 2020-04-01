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

import * as WorkflowsActions from "../workflows/workflows.actions";
import {ProjectModel} from "../../models/project.model";
import {WorkflowModel} from "../../models/workflow.model";
import {workflowModes} from "../../models/enums/workflowModes.constants";
import {WorkflowJoinedModel} from "../../models/workflowJoined.model";

export interface State {
  projects: ProjectModel[],
  workflows: WorkflowModel[],
  loading: boolean,
  selectedWorkflow: {
    id: number,
    mode: string,
    loading: boolean,
    workflow: WorkflowJoinedModel
  }
}

const initialState: State = {
  projects: [],
  workflows: [],
  loading: true,
  selectedWorkflow: {
    id: undefined,
    mode: workflowModes.CREATE,
    loading: true,
    workflow: undefined
  }
};

export function workflowsReducer(state: State = initialState, action: WorkflowsActions.WorkflowsActions) {
  switch (action.type) {
    case (WorkflowsActions.INITIALIZE_WORKFLOWS):
      return {...state, loading: true};
    case (WorkflowsActions.INITIALIZE_WORKFLOWS_SUCCESS):
      return {...state, loading: false, projects: action.payload.projects, workflows: action.payload.workflows};
    case (WorkflowsActions.INITIALIZE_WORKFLOWS_FAILURE):
      return {...initialState, loading: false};
    case (WorkflowsActions.STAR_WORKFLOW_INITIALIZATION):
      return {...state, selectedWorkflow: {
          ...initialState.selectedWorkflow, id: action.payload.id, mode: action.payload.mode, loading: true
        }};
    case (WorkflowsActions.SET_EMPTY_WORKFLOW):
      return {...state, selectedWorkflow: {
          ...state.selectedWorkflow, workflow: action.payload, loading: false
        }};
    case (WorkflowsActions.LOAD_WORKFLOW_SUCCESS):
      return {...state, selectedWorkflow: {
          ...state.selectedWorkflow, workflow: action.payload, loading: false
        }};
    case (WorkflowsActions.LOAD_WORKFLOW_FAILURE):
      return {...state, selectedWorkflow: {
          ...initialState.selectedWorkflow, loading: false
        }};
    case (WorkflowsActions.LOAD_WORKFLOW_FAILURE_INCORRECT_ID):
      return {...state, selectedWorkflow: {
          ...state.selectedWorkflow, loading: false
        }};
    default:
      return state;
  }
}
