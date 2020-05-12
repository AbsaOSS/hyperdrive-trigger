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

import * as WorkflowsActions from '../workflows/workflows.actions';
import { ProjectModel } from '../../models/project.model';
import { WorkflowJoinedModel } from '../../models/workflowJoined.model';
import { WorkflowFormPartsModel } from '../../models/workflowFormParts.model';
import { WorkflowEntryModel } from '../../models/workflowEntry.model';

export interface State {
  projects: ProjectModel[];
  loading: boolean;
  workflowAction: {
    id: number;
    mode: string;
    loading: boolean;
    workflow: WorkflowJoinedModel;
    workflowData: {
      details: { property: string; value: any }[];
      sensor: { property: string; value: any }[];
      jobs: { order: number; job: { property: string; value: any }[] }[];
    };
  };
  workflowFormParts: WorkflowFormPartsModel;
}

const initialState: State = {
  projects: [],
  loading: true,
  workflowAction: {
    id: undefined,
    mode: undefined,
    loading: true,
    workflow: undefined,
    workflowData: {
      details: [],
      sensor: [],
      jobs: [],
    },
  },
  workflowFormParts: undefined,
};

export function workflowsReducer(state: State = initialState, action: WorkflowsActions.WorkflowsActions) {
  switch (action.type) {
    case WorkflowsActions.INITIALIZE_WORKFLOWS:
      return { ...state, loading: true };
    case WorkflowsActions.INITIALIZE_WORKFLOWS_SUCCESS:
      return { ...state, loading: false, projects: action.payload.projects, workflowFormParts: action.payload.workflowFormParts };
    case WorkflowsActions.INITIALIZE_WORKFLOWS_FAILURE:
      return { ...initialState, loading: false };

    case WorkflowsActions.START_WORKFLOW_INITIALIZATION:
      return {
        ...state,
        workflowAction: {
          ...initialState.workflowAction,
          id: action.payload.id,
          mode: action.payload.mode,
          loading: true,
        },
      };
    case WorkflowsActions.SET_EMPTY_WORKFLOW:
      return {
        ...state,
        workflowAction: {
          ...initialState.workflowAction,
          loading: false,
        },
      };
    case WorkflowsActions.LOAD_WORKFLOW_SUCCESS:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflow: action.payload.workflow,
          loading: false,
          workflowData: {
            ...state.workflowAction.workflowData,
            details: action.payload.detailsData,
            sensor: action.payload.sensorData,
            jobs: action.payload.jobsData,
          },
        },
      };
    case WorkflowsActions.LOAD_WORKFLOW_FAILURE:
      return {
        ...state,
        workflowAction: {
          ...initialState.workflowAction,
          loading: false,
        },
      };
    case WorkflowsActions.LOAD_WORKFLOW_FAILURE_INCORRECT_ID:
      return {
        ...state,
        workflowAction: {
          ...initialState.workflowAction,
          loading: false,
        },
      };
    case WorkflowsActions.WORKFLOW_DETAILS_CHANGED:
      const detailsData = [
        ...state.workflowAction.workflowData.details.filter((item) => item.property !== action.payload.property),
        action.payload,
      ];
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowData: {
            ...state.workflowAction.workflowData,
            details: [...detailsData],
          },
        },
      };
    case WorkflowsActions.WORKFLOW_SENSOR_CHANGED:
      const sensorData = [
        ...state.workflowAction.workflowData.sensor.filter((item) => item.property !== action.payload.property),
        action.payload,
      ];
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowData: {
            ...state.workflowAction.workflowData,
            sensor: [...sensorData],
          },
        },
      };
    case WorkflowsActions.WORKFLOW_SENSOR_TYPE_SWITCHED:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowData: {
            ...state.workflowAction.workflowData,
            sensor: [
              ...initialState.workflowAction.workflowData.sensor,
              { property: action.payload.property, value: action.payload.value },
            ],
          },
        },
      };
    case WorkflowsActions.WORKFLOW_ADD_EMPTY_JOB:
      const emptyJobData = { order: action.payload, job: [] };
      const jobs = [...state.workflowAction.workflowData.jobs, emptyJobData];
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowData: {
            ...state.workflowAction.workflowData,
            jobs: [...jobs],
          },
        },
      };
    case WorkflowsActions.WORKFLOW_JOB_CHANGED:
      const oldJobDataOption = state.workflowAction.workflowData.jobs.find((job) => job.order == action.payload.order);
      const oldJobData: WorkflowEntryModel[] = !!oldJobDataOption ? oldJobDataOption.job : [];
      const filteredOldJobData = oldJobData.filter((jobEntry) => jobEntry.property !== action.payload.jobEntry.property);
      const updatedJobData = [...filteredOldJobData, { property: action.payload.jobEntry.property, value: action.payload.jobEntry.value }];
      const updatedJobsData = [
        ...state.workflowAction.workflowData.jobs.filter((jobEntries) => jobEntries.order !== action.payload.order),
        { order: action.payload.order, job: updatedJobData },
      ];
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowData: {
            ...state.workflowAction.workflowData,
            jobs: [...initialState.workflowAction.workflowData.jobs, ...updatedJobsData],
          },
        },
      };
    case WorkflowsActions.WORKFLOW_JOB_TYPE_SWITCHED:
      const cleanedJobData = {
        order: action.payload.order,
        job: [{ property: action.payload.jobEntry.property, value: action.payload.jobEntry.value }],
      };
      const cleanedJobsData = [
        ...state.workflowAction.workflowData.jobs.filter((item) => item.order !== action.payload.order),
        cleanedJobData,
      ];
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowData: {
            ...state.workflowAction.workflowData,
            jobs: [...initialState.workflowAction.workflowData.jobs, ...cleanedJobsData],
          },
        },
      };
    case WorkflowsActions.DELETE_WORKFLOW_SUCCESS:
      const newProjects = state.projects.map(project => {
        return {name: project.name, workflows: project.workflows.filter(workflow => workflow.id != action.payload)}
      });
      return {...state, projects: [...newProjects]};
    default:
      return state;
  }
}
