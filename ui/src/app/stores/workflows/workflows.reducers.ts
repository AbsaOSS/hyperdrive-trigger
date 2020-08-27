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
import { JobEntryModel, JobEntryModelFactory } from '../../models/jobEntry.model';
import { SortAttributesModel } from '../../models/search/sortAttributes.model';
import { WorkflowFormDataModel } from '../../models/workflowFormData.model';
import { HistoryModel } from '../../models/historyModel';
import { JobForRunModel } from '../../models/jobForRun.model';

export interface State {
  projects: ProjectModel[];
  loading: boolean;
  workflowAction: {
    id: number;
    mode: string;
    loading: boolean;
    workflow: WorkflowJoinedModel;
    workflowFormParts: WorkflowFormPartsModel;
    backendValidationErrors: string[];
    workflowFormData: WorkflowFormDataModel;
    workflowPath: File;
  };
  workflowsSort: SortAttributesModel;
  workflowsFilters: any[];
  history: {
    loading: boolean;
    workflowHistory: HistoryModel[];
    workflowFormParts: WorkflowFormPartsModel;
    leftWorkflowHistoryData: WorkflowFormDataModel;
    leftWorkflowHistory: HistoryModel;
    rightWorkflowHistoryData: WorkflowFormDataModel;
    rightWorkflowHistory: HistoryModel;
  };
  jobsForRun: {
    isOpen: boolean;
    loading: boolean;
    workflowId: number;
    jobs: JobForRunModel[];
    isSuccessfullyLoaded: boolean;
  };
}

const initialState: State = {
  projects: [],
  loading: true,
  workflowAction: {
    id: undefined,
    mode: undefined,
    loading: true,
    workflow: undefined,
    workflowFormParts: undefined,
    backendValidationErrors: [],
    workflowFormData: {
      details: [],
      sensor: [],
      jobs: [],
    },
    workflowPath: undefined,
  },
  workflowsSort: undefined,
  workflowsFilters: undefined,
  history: {
    loading: true,
    workflowHistory: [],
    workflowFormParts: undefined,
    leftWorkflowHistoryData: undefined,
    leftWorkflowHistory: undefined,
    rightWorkflowHistoryData: undefined,
    rightWorkflowHistory: undefined,
  },
  jobsForRun: {
    isOpen: false,
    loading: true,
    workflowId: undefined,
    jobs: undefined,
    isSuccessfullyLoaded: false,
  },
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
      return {
        ...state,
        loading: false,
        projects: action.payload.projects,
        workflowAction: {
          ...state.workflowAction,
          workflowFormParts: action.payload.workflowFormParts,
        },
      };
    case WorkflowsActions.INITIALIZE_WORKFLOWS_FAILURE:
      return { ...initialState, loading: false };

    case WorkflowsActions.START_WORKFLOW_INITIALIZATION:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
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
          workflowFormParts: state.workflowAction.workflowFormParts,
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
          workflowFormData: {
            ...state.workflowAction.workflowFormData,
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
        ...state.workflowAction.workflowFormData.details.filter((item) => item.property !== action.payload.property),
        action.payload,
      ];
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowFormData: {
            ...state.workflowAction.workflowFormData,
            details: [...detailsData],
          },
        },
      };
    case WorkflowsActions.WORKFLOW_SENSOR_CHANGED:
      const sensorData = [
        ...state.workflowAction.workflowFormData.sensor.filter((item) => item.property !== action.payload.property),
        action.payload,
      ];
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowFormData: {
            ...state.workflowAction.workflowFormData,
            sensor: [...sensorData],
          },
        },
      };
    case WorkflowsActions.WORKFLOW_SENSOR_TYPE_SWITCHED:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowFormData: {
            ...state.workflowAction.workflowFormData,
            sensor: [...initialState.workflowAction.workflowFormData.sensor, action.payload],
          },
        },
      };
    case WorkflowsActions.WORKFLOW_ADD_EMPTY_JOB:
      const emptyJobData = JobEntryModelFactory.createWithUuid(action.payload, []);
      const jobs = [...state.workflowAction.workflowFormData.jobs, emptyJobData];
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowFormData: {
            ...state.workflowAction.workflowFormData,
            jobs: [...jobs],
          },
        },
      };
    case WorkflowsActions.WORKFLOW_REMOVE_JOB: {
      const jobId: string = action.payload;
      const jobsAfterRemoval = removeJob(jobId, state.workflowAction.workflowFormData.jobs);
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowFormData: {
            ...state.workflowAction.workflowFormData,
            jobs: [...jobsAfterRemoval],
          },
        },
      };
    }
    case WorkflowsActions.WORKFLOW_JOB_CHANGED: {
      const oldJob = state.workflowAction.workflowFormData.jobs.find((job) => job.jobId === action.payload.jobId);
      const filteredOldJobData = oldJob.entries.filter((jobEntry) => jobEntry.property !== action.payload.jobEntry.property);
      const updatedJobData = [...filteredOldJobData, action.payload.jobEntry];
      const updatedJobsData = [
        ...state.workflowAction.workflowFormData.jobs.filter((jobEntry) => jobEntry.jobId !== action.payload.jobId),
        JobEntryModelFactory.create(oldJob.jobId, oldJob.order, updatedJobData),
      ];
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowFormData: {
            ...state.workflowAction.workflowFormData,
            jobs: [...initialState.workflowAction.workflowFormData.jobs, ...updatedJobsData],
          },
        },
      };
    }
    case WorkflowsActions.WORKFLOW_JOB_TYPE_SWITCHED:
      const oldJob = state.workflowAction.workflowFormData.jobs.find((job) => job.jobId === action.payload.jobId);
      const cleanedJobData = JobEntryModelFactory.create(oldJob.jobId, oldJob.order, [action.payload.jobEntry]);

      const cleanedJobsData = [
        ...state.workflowAction.workflowFormData.jobs.filter((item) => item.jobId !== action.payload.jobId),
        cleanedJobData,
      ];
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowFormData: {
            ...state.workflowAction.workflowFormData,
            jobs: [...initialState.workflowAction.workflowFormData.jobs, ...cleanedJobsData],
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
      let newProjects = state.projects.map((project) => {
        return ProjectModelFactory.create(
          project.name,
          project.workflows.filter((workflow) => workflow.id != action.payload),
        );
      });
      newProjects = newProjects.filter((project) => project.workflows.length !== 0);
      return {
        ...state,
        projects: [...newProjects],
        workflowAction: {
          ...state.workflowAction,
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
          backendValidationErrors: action.payload,
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
        updatedProjects = [...projectsWithoutWorkflow, ProjectModelFactory.create(action.payload.project, [action.payload])];
      }
      updatedProjects = updatedProjects.filter((project) => project.workflows.length !== 0);
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
          backendValidationErrors: action.payload,
        },
      };
    case WorkflowsActions.REMOVE_BACKEND_VALIDATION_ERROR:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          backendValidationErrors: [
            ...state.workflowAction.backendValidationErrors.slice(0, action.payload),
            ...state.workflowAction.backendValidationErrors.slice(action.payload + 1),
          ],
        },
      };
    case WorkflowsActions.SET_WORKFLOWS_SORT:
      return {
        ...state,
        workflowsSort: action.payload,
      };
    case WorkflowsActions.SET_WORKFLOWS_FILTERS:
      return {
        ...state,
        workflowsFilters: action.payload,
      };
    case WorkflowsActions.LOAD_HISTORY_FOR_WORKFLOW:
      return {
        ...state,
        history: {
          ...initialState.history,
          loading: true,
        },
      };
    case WorkflowsActions.LOAD_HISTORY_FOR_WORKFLOW_SUCCESS:
      return {
        ...state,
        history: {
          ...state.history,
          loading: false,
          workflowHistory: action.payload,
        },
      };
    case WorkflowsActions.LOAD_HISTORY_FOR_WORKFLOW_FAILURE:
      return {
        ...state,
        history: {
          ...initialState.history,
          loading: false,
        },
      };
    case WorkflowsActions.LOAD_WORKFLOWS_FROM_HISTORY:
      return {
        ...state,
        history: {
          ...initialState.history,
          loading: true,
        },
      };
    case WorkflowsActions.LOAD_WORKFLOWS_FROM_HISTORY_SUCCESS:
      return {
        ...state,
        history: {
          ...state.history,
          loading: false,
          workflowFormParts: action.payload.workflowFormParts,
          leftWorkflowHistoryData: action.payload.leftWorkflowHistoryData,
          leftWorkflowHistory: action.payload.leftWorkflowHistory,
          rightWorkflowHistoryData: action.payload.rightWorkflowHistoryData,
          rightWorkflowHistory: action.payload.rightWorkflowHistory,
        },
      };
    case WorkflowsActions.LOAD_WORKFLOWS_FROM_HISTORY_FAILURE:
      return {
        ...state,
        history: {
          ...initialState.history,
          loading: false,
        },
      };
    case WorkflowsActions.LOAD_JOBS_FOR_RUN:
      return {
        ...state,
        jobsForRun: {
          ...initialState.jobsForRun,
          workflowId: action.payload,
          loading: true,
          isOpen: true,
        },
      };
    case WorkflowsActions.LOAD_JOBS_FOR_RUN_SUCCESS:
      return {
        ...state,
        jobsForRun: {
          ...state.jobsForRun,
          loading: false,
          jobs: action.payload,
          isSuccessfullyLoaded: true,
          isOpen: true,
        },
      };
    case WorkflowsActions.LOAD_JOBS_FOR_RUN_FAILURE:
      return {
        ...state,
        jobsForRun: {
          ...initialState.jobsForRun,
          loading: false,
          isSuccessfullyLoaded: false,
          isOpen: true,
        },
      };
    case WorkflowsActions.RUN_JOBS:
      return {
        ...state,
        jobsForRun: {
          ...initialState.jobsForRun,
          loading: false,
          isOpen: false,
        },
      };
    case WorkflowsActions.RUN_JOBS_CANCEL:
      return {
        ...state,
        jobsForRun: {
          ...initialState.jobsForRun,
          isOpen: false,
        },
      };
    case WorkflowsActions.EXPORT_WORKFLOW:
      return {
        ...state,
        loading: true,
      };
    case WorkflowsActions.EXPORT_WORKFLOW_DONE:
      return {
        ...state,
        loading: false,
      };
    case WorkflowsActions.SET_WORKFLOW_FILE:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowPath: action.payload,
        },
      };
    case WorkflowsActions.IMPORT_WORKFLOW:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          loading: true,
        },
      };
    case WorkflowsActions.IMPORT_WORKFLOW_FAILURE:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflow: undefined,
          workflowPath: undefined,
          loading: false,
        },
      };
    default:
      return state;
  }
}
