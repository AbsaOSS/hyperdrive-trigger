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
import {PropertiesModel, SensorModel, SettingsModel} from "../../models/sensor.model";
import {DagDefinitionJoinedModel} from "../../models/dagDefinitionJoined.model";
import {SensorTypeModel, SensorTypesModel} from "../../models/sensorTypes.model";
import {JobTypesModel} from "../../models/jobTypes.model";
import {WORKFLOW_ACTION_CHANGED} from "../workflows/workflows.actions";

export interface State {
  projects: ProjectModel[],
  workflows: WorkflowModel[],
  loading: boolean,
  workflowAction: {
    id: number,
    mode: string,
    loading: boolean,
    originalWorkflow: WorkflowJoinedModel,
    actionWorkflow: WorkflowJoinedModel
  },
  sensorTypes: SensorTypesModel,
  jobTypes: JobTypesModel
}

const emptyWorkflow = {
  name: '',
  isActive: false,
  project: '',
  sensor: {
    sensorType: {name: ''},
    properties: undefined
  },
  dagDefinitionJoined: null,
  id: undefined
};



const initialState: State = {
  projects: [],
  workflows: [],
  loading: true,
  sensorTypes: undefined,
  jobTypes: undefined,
  workflowAction: {
    id: undefined,
    mode: workflowModes.CREATE,
    loading: true,
    originalWorkflow: {...emptyWorkflow},
    actionWorkflow: {...emptyWorkflow}
  }
};

export function workflowsReducer(state: State = initialState, action: WorkflowsActions.WorkflowsActions) {
  switch (action.type) {
    case (WorkflowsActions.INITIALIZE_WORKFLOWS):
      return {...state, loading: true};
    case (WorkflowsActions.INITIALIZE_WORKFLOWS_SUCCESS):
      return {...state, loading: false, projects: action.payload.projects, workflows: action.payload.workflows, sensorTypes: action.payload.sensorTypes};
    case (WorkflowsActions.INITIALIZE_WORKFLOWS_FAILURE):
      return {...initialState, loading: false};
    case (WorkflowsActions.STAR_WORKFLOW_INITIALIZATION):
      return {...state, workflowAction: {
          ...initialState.workflowAction, id: action.payload.id, mode: action.payload.mode, loading: true
        }};
    case (WorkflowsActions.SET_EMPTY_WORKFLOW):
      return {...state, workflowAction: {
          ...state.workflowAction, actionWorkflow: emptyWorkflow, originalWorkflow: emptyWorkflow, loading: false
        }};
    case (WorkflowsActions.LOAD_WORKFLOW_SUCCESS):
      return {...state, workflowAction: {
          ...state.workflowAction, actionWorkflow: action.payload, originalWorkflow: action.payload, loading: false
        }};
    case (WorkflowsActions.LOAD_WORKFLOW_FAILURE):
      return {...state, workflowAction: {
          ...initialState.workflowAction, loading: false
        }};
    case (WorkflowsActions.LOAD_WORKFLOW_FAILURE_INCORRECT_ID):
      return {...state, workflowAction: {
          ...initialState.workflowAction, loading: false
        }};
    case (WorkflowsActions.WORKFLOW_ACTION_CHANGED):
      return {...state, workflowAction: {
          ...state.workflowAction, actionWorkflow: action.payload
        }};
    default:
      return state;
  }
}
