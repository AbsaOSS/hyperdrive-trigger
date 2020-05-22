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
import { ProjectModel, ProjectModelFactory } from '../../models/project.model';
import { WorkflowJoinedModel } from '../../models/workflowJoined.model';
import { WorkflowFormPartsModel } from '../../models/workflowFormParts.model';
import { WorkflowEntryModel } from '../../models/workflowEntry.model';
import { JobEntryModel, JobEntryModelFactory } from '../../models/jobEntry.model';

export interface State {
  projects: ProjectModel[];
  loading: boolean;
  workflowAction: {
    id: number;
    mode: string;
    loading: boolean;
    workflow: WorkflowJoinedModel;
    workflowData: {
      details: WorkflowEntryModel[];
      sensor: WorkflowEntryModel[];
      jobs: JobEntryModel[];
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

function removeJob(jobId: string, jobsOriginal: JobEntryModel[]): JobEntryModel[] {
  const jobs = [...jobsOriginal];
  const removeIndex = jobs.findIndex((job) => job.jobId === jobId);
  const removeOrder = jobs[removeIndex].order;
  jobs.splice(removeIndex, 1);
  return jobs.map((jobOrig) => {
    if (jobOrig.order > removeOrder) {
      const job = { ...jobOrig };
      job.order -= 1;
      return job;
    } else {
      return jobOrig;
    }
  });
}

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
            sensor: [...initialState.workflowAction.workflowData.sensor, action.payload],
          },
        },
      };
    case WorkflowsActions.WORKFLOW_ADD_EMPTY_JOB:
      const emptyJobData = JobEntryModelFactory.createWithUuid(action.payload, []);
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
    case WorkflowsActions.WORKFLOW_REMOVE_JOB: {
      const jobId: string = action.payload;
      const jobsAfterRemoval = removeJob(jobId, state.workflowAction.workflowData.jobs);
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowData: {
            ...state.workflowAction.workflowData,
            jobs: [...jobsAfterRemoval],
          },
        },
      };
    }
    case WorkflowsActions.WORKFLOW_JOB_CHANGED: {
      const oldJob = state.workflowAction.workflowData.jobs.find((job) => job.jobId === action.payload.jobId);
      const filteredOldJobData = oldJob.entries.filter((jobEntry) => jobEntry.property !== action.payload.jobEntry.property);
      const updatedJobData = [...filteredOldJobData, action.payload.jobEntry];
      const updatedJobsData = [
        ...state.workflowAction.workflowData.jobs.filter((jobEntry) => jobEntry.jobId !== action.payload.jobId),
        JobEntryModelFactory.create(oldJob.jobId, oldJob.order, updatedJobData),
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
    }
    case WorkflowsActions.WORKFLOW_JOB_TYPE_SWITCHED:
      const oldJob = state.workflowAction.workflowData.jobs.find((job) => job.jobId === action.payload.jobId);
      const cleanedJobData = JobEntryModelFactory.create(oldJob.jobId, oldJob.order, [action.payload.jobEntry]);

      const cleanedJobsData = [
        ...state.workflowAction.workflowData.jobs.filter((item) => item.jobId !== action.payload.jobId),
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
    case WorkflowsActions.DELETE_WORKFLOW:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
        },
        loading: true,
      };
    case WorkflowsActions.DELETE_WORKFLOW_SUCCESS:
      const newProjects = state.projects.map((project) => {
        return ProjectModelFactory.create(
          project.name,
          project.workflows.filter((workflow) => workflow.id != action.payload),
        );
      });
      return {
        ...state,
        projects: [...newProjects],
        workflowAction: {
          ...initialState.workflowAction,
        },
        loading: false,
      };
    case WorkflowsActions.DELETE_WORKFLOW_FAILURE:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
        },
        loading: false,
      };
    case WorkflowsActions.SWITCH_WORKFLOW_ACTIVE_STATE:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
        },
        loading: true,
      };
    case WorkflowsActions.SWITCH_WORKFLOW_ACTIVE_STATE_SUCCESS:
      const updatedProjects = state.projects.map((project) => {
        return ProjectModelFactory.create(
          project.name,
          project.workflows.map((workflow) => {
            return workflow.id == action.payload ? { ...workflow, isActive: !workflow.isActive } : workflow;
          }),
        );
      });
      return {
        ...state,
        projects: [...updatedProjects],
        workflowAction: {
          ...state.workflowAction,
        },
        loading: false,
      };
    case WorkflowsActions.SWITCH_WORKFLOW_ACTIVE_STATE_FAILURE:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
        },
        loading: false,
      };
    case WorkflowsActions.RUN_WORKFLOW:
      return {
        ...state,
        loading: true,
      };
    case WorkflowsActions.RUN_WORKFLOW_SUCCESS:
      return {
        ...state,
        loading: false,
      };
    case WorkflowsActions.RUN_WORKFLOW_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case WorkflowsActions.CREATE_WORKFLOW:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          loading: true,
        },
      };
    case WorkflowsActions.CREATE_WORKFLOW_SUCCESS:
      let projects;
      if (state.projects.some((project) => project.name == action.payload.project)) {
        projects = state.projects.map((project) =>
          project.name == action.payload.project ? { ...project, workflows: [...project.workflows, action.payload] } : project,
        );
      } else {
        projects = [...state.projects, ProjectModelFactory.create(action.payload.project, [action.payload])];
      }
      return {
        ...state,
        projects: [...projects],
        workflowAction: {
          ...state.workflowAction,
          loading: false,
        },
      };
    case WorkflowsActions.CREATE_WORKFLOW_FAILURE:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          loading: false,
        },
      };
    case WorkflowsActions.UPDATE_WORKFLOW:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          loading: true,
        },
      };
    case WorkflowsActions.UPDATE_WORKFLOW_SUCCESS: {
      const projectsWithoutWorkflow = state.projects.map((project) => {
        return ProjectModelFactory.create(
          project.name,
          project.workflows.filter((workflow) => workflow.id != action.payload.id),
        );
      });
      let updatedProjects;
      if (state.projects.some((project) => project.name == action.payload.project)) {
        updatedProjects = projectsWithoutWorkflow.map((project) =>
          project.name == action.payload.project ? { ...project, workflows: [...project.workflows, action.payload] } : project,
        );
      } else {
        updatedProjects = [...state.projects, ProjectModelFactory.create(action.payload.project, [action.payload])];
      }
      return {
        ...state,
        projects: [...updatedProjects],
        workflowAction: {
          ...state.workflowAction,
          loading: false,
        },
      };
    }
    case WorkflowsActions.UPDATE_WORKFLOW_FAILURE:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          loading: false,
        },
      };
    default:
      return state;
  }
}
