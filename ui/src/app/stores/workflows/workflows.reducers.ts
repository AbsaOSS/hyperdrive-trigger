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
import {WorkflowComponentsModel} from "../../models/workflowComponents.model";
import {PropertiesModel, SensorModel, SettingsModel} from "../../models/sensor.model";
import {DagDefinitionJoinedModel} from "../../models/dagDefinitionJoined.model";
import {JobDefinitionModel, JobParametersModel} from "../../models/jobDefinition.model";
import {WORKFLOW_SENSOR_CLEANED} from "../workflows/workflows.actions";
import {act} from "@ngrx/effects";
import {WorkflowFormPartsModel} from "../../models/workflowFormParts.model";

export interface State {
  projects: ProjectModel[],
  workflows: WorkflowModel[],
  loading: boolean,
  workflowAction: {
    id: number,
    mode: string,
    loading: boolean,
    workflow: WorkflowJoinedModel,
    workflowChanges: {
      details: {property: string, value: any}[],
      sensor: {property: string, value: any}[],
      jobs: {order: number, job: {property: string, value: any}[]}[]
    }
  },
  workflowFormParts: WorkflowFormPartsModel
}

const initialState: State = {
  projects: [],
  workflows: [],
  loading: true,
  workflowAction: {
    id: undefined,
    mode: undefined,
    loading: true,
    workflow: undefined,
    workflowChanges: {
      details: [],
      sensor: [],
      jobs: []
    }
  },
  workflowFormParts: undefined
};

export function workflowsReducer(state: State = initialState, action: WorkflowsActions.WorkflowsActions) {
  switch (action.type) {
    case (WorkflowsActions.INITIALIZE_WORKFLOWS):
      return {...state, loading: true};
    case (WorkflowsActions.INITIALIZE_WORKFLOWS_SUCCESS):
      return {...state, loading: false, projects: action.payload.projects, workflows: action.payload.workflows, workflowFormParts: action.payload.workflowFormParts};
    case (WorkflowsActions.INITIALIZE_WORKFLOWS_FAILURE):
      return {...initialState, loading: false};

    case (WorkflowsActions.STAR_WORKFLOW_INITIALIZATION):
      return {...state, workflowAction: {
          ...initialState.workflowAction, id: action.payload.id, mode: action.payload.mode, loading: true
        }};
    case (WorkflowsActions.SET_EMPTY_WORKFLOW):
      return {...state, workflowAction: {
          ...initialState.workflowAction, loading: false
        }};
    case (WorkflowsActions.LOAD_WORKFLOW_SUCCESS):
      return {...state, workflowAction: {
          ...state.workflowAction, workflow: action.payload.workflow, loading: false,
          workflowChanges: {...state.workflowAction.workflowChanges,
            details: action.payload.detailsData, sensor: action.payload.sensorData, jobs: action.payload.jobsData}
        }};
    case (WorkflowsActions.LOAD_WORKFLOW_FAILURE):
      return {...state, workflowAction: {
          ...initialState.workflowAction, loading: false
        }};
    case (WorkflowsActions.LOAD_WORKFLOW_FAILURE_INCORRECT_ID):
      return {...state, workflowAction: {
          ...initialState.workflowAction, loading: false
        }};
    case (WorkflowsActions.WORKFLOW_DETAILS_CHANGED):
      const details = [...state.workflowAction.workflowChanges.details.filter(item => item.property !== action.payload.property), action.payload];
      return {...state, workflowAction: {
          ...state.workflowAction, workflowChanges: {
            ...state.workflowAction.workflowChanges, details: [...details]
          }
        }};
    case (WorkflowsActions.WORKFLOW_SENSOR_CHANGED):
      const sensor = [...state.workflowAction.workflowChanges.sensor.filter(item => item.property !== action.payload.property), action.payload];
      return {...state, workflowAction: {
          ...state.workflowAction, workflowChanges: {
            ...state.workflowAction.workflowChanges, sensor: [...sensor]
          }
        }};
    case (WorkflowsActions.WORKFLOW_SENSOR_CLEANED):
      return {...state, workflowAction: {
          ...state.workflowAction, workflowChanges: {
            ...state.workflowAction.workflowChanges, sensor: [...initialState.workflowAction.workflowChanges.sensor, action.payload]
          }
        }};
    case (WorkflowsActions.WORKFLOW_ADD_EMPTY_JOB):
      const emptyJob = {order: action.payload, job: []};
      const jobs = [...state.workflowAction.workflowChanges.jobs, emptyJob];
      return {...state, workflowAction: {
          ...state.workflowAction, workflowChanges: {
            ...state.workflowAction.workflowChanges, jobs: [...jobs]
          }
        }};
    case (WorkflowsActions.WORKFLOW_JOB_CHANGED):
      const old = state.workflowAction.workflowChanges.jobs.find(xx => xx.order == action.payload.order);
      const oldData: {property: string, value: any}[] = !!old ? old.job : [];
      const filtered = oldData.filter(item => item.property !== action.payload.property);

      const newDa = [...filtered, {property: action.payload.property, value: action.payload.value}];

      const jobsss = [...state.workflowAction.workflowChanges.jobs.filter(item => item.order !== action.payload.order), {order: action.payload.order, job: newDa}];
      return {...state, workflowAction: {
          ...state.workflowAction, workflowChanges: {
            ...state.workflowAction.workflowChanges, jobs: [...initialState.workflowAction.workflowChanges.jobs, ...jobsss]
          }
        }};
    case (WorkflowsActions.WORKFLOW_JOB_CLEANED):
      const newData = {order: action.payload.order, job:[{property: action.payload.property, value: action.payload.value}]};
      const jobss = [...state.workflowAction.workflowChanges.jobs.filter(item => item.order !== action.payload.order), newData];

      return {...state, workflowAction: {
          ...state.workflowAction, workflowChanges: {
            ...state.workflowAction.workflowChanges, jobs: [...initialState.workflowAction.workflowChanges.jobs, ...jobss]
          }
        }};
    default:
      return state;
  }
}
