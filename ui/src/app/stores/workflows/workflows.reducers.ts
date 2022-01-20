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
import { ProjectModel, ProjectModelFactory, WorkflowIdentityModelFactory } from '../../models/project.model';
import { WorkflowJoinedModel } from '../../models/workflowJoined.model';
import { HistoryModel, WorkflowHistoryModel } from '../../models/historyModel';
import { JobForRunModel } from '../../models/jobForRun.model';
import { workflowModes } from '../../models/enums/workflowModes.constants';
import { JobTemplateModel } from '../../models/jobTemplate.model';
import { WorkflowModel } from '../../models/workflow.model';
import { TableSearchRequestModel } from '../../models/search/tableSearchRequest.model';

export interface State {
  workflowsSearch: {
    loading: boolean;
    workflows: WorkflowModel[];
    total: number;
    searchRequest: TableSearchRequestModel;
  };
  projects: ProjectModel[];
  jobTemplates: JobTemplateModel[];
  loading: boolean;
  workflowAction: {
    id: number;
    mode: string;
    loading: boolean;
    workflow: WorkflowJoinedModel;
    workflowForForm: WorkflowJoinedModel;
    backendValidationErrors: string[];
    workflowFile: File;
  };
  history: {
    loading: boolean;
    workflowHistory: HistoryModel[];
    leftWorkflowHistory: WorkflowHistoryModel;
    rightWorkflowHistory: WorkflowHistoryModel;
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
  workflowsSearch: {
    loading: true,
    workflows: [],
    total: 0,
    searchRequest: undefined,
  },
  projects: [],
  jobTemplates: [],
  loading: true,
  workflowAction: {
    id: undefined,
    mode: undefined,
    loading: false,
    workflow: undefined,
    workflowForForm: undefined,
    backendValidationErrors: [],
    workflowFile: undefined,
  },
  history: {
    loading: true,
    workflowHistory: [],
    leftWorkflowHistory: undefined,
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

export function workflowsReducer(state: State = initialState, action: WorkflowsActions.WorkflowsActions) {
  switch (action.type) {
    case WorkflowsActions.INITIALIZE_WORKFLOWS:
      return { ...state, loading: true };
    case WorkflowsActions.INITIALIZE_WORKFLOWS_SUCCESS:
      let sortedProjects = [...action.payload.projects];
      sortedProjects = sortProjects(sortedProjects);
      return {
        ...state,
        loading: false,
        projects: sortedProjects,
        jobTemplates: action.payload.jobTemplates,
      };
    case WorkflowsActions.INITIALIZE_WORKFLOWS_FAILURE:
      return { ...state, contentLoading: false };
    case WorkflowsActions.SEARCH_WORKFLOWS:
      return {
        ...state,
        workflowsSearch: {
          ...state.workflowsSearch,
          searchRequest: action.payload,
          loading: true,
        },
      };
    case WorkflowsActions.SEARCH_WORKFLOWS_SUCCESS:
      return {
        ...state,
        workflowsSearch: {
          ...state.workflowsSearch,
          workflows: action.payload.workflows,
          total: action.payload.total,
          loading: false,
        },
        workflowAction: {
          ...state.workflowAction,
          loading: false,
        },
      };
    case WorkflowsActions.SEARCH_WORKFLOWS_FAILURE:
      return {
        ...state,
        workflowsSearch: {
          ...state.workflowsSearch,
          loading: false,
        },
        workflowAction: {
          ...state.workflowAction,
          loading: false,
        },
      };
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
          workflow: action.payload,
          workflowForForm: action.payload,
          loading: false,
        },
      };
    case WorkflowsActions.LOAD_WORKFLOW_SUCCESS:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflow: action.payload,
          workflowForForm: action.payload,
          loading: false,
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
    case WorkflowsActions.WORKFLOW_CHANGED:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowForForm: action.payload,
          loading: false,
        },
      };
    case WorkflowsActions.DELETE_WORKFLOW:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          loading: true,
        },
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
          loading: false,
        },
      };
    case WorkflowsActions.DELETE_WORKFLOW_FAILURE:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          loading: false,
        },
      };
    case WorkflowsActions.SWITCH_WORKFLOW_ACTIVE_STATE:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          loading: true,
        },
      };
    case WorkflowsActions.SWITCH_WORKFLOW_ACTIVE_STATE_SUCCESS:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflow: {
            ...state.workflowAction.workflow,
            isActive: !state.workflowAction.workflow,
          },
          workflowForForm: {
            ...state.workflowAction.workflowForForm,
            isActive: !state.workflowAction.workflowForForm,
          },
          loading: false,
        },
      };
    case WorkflowsActions.SWITCH_WORKFLOW_ACTIVE_STATE_FAILURE:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          loading: false,
        },
      };
    case WorkflowsActions.UPDATE_WORKFLOWS_IS_ACTIVE:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          loading: true,
        },
      };
    case WorkflowsActions.UPDATE_WORKFLOWS_IS_ACTIVE_SUCCESS: {
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          loading: false,
        },
      };
    }
    case WorkflowsActions.UPDATE_WORKFLOWS_IS_ACTIVE_FAILURE:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          loading: false,
        },
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
      const projects = sortProjects([...addWorkflow([action.payload], state.projects)]);
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
          project.name == action.payload.project
            ? { ...project, workflows: [...project.workflows, WorkflowIdentityModelFactory.create(action.payload.id, action.payload.name)] }
            : project,
        );
      } else {
        updatedProjects = [
          ...projectsWithoutWorkflow,
          ProjectModelFactory.create(action.payload.project, [WorkflowIdentityModelFactory.create(action.payload.id, action.payload.name)]),
        ];
      }
      updatedProjects = updatedProjects.filter((project) => project.workflows.length !== 0);
      const sortUpdatedProjects = sortProjects([...updatedProjects]);
      return {
        ...state,
        projects: [...sortUpdatedProjects],
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
          leftWorkflowHistory: action.payload.leftWorkflowHistory,
          rightWorkflowHistory: action.payload.rightWorkflowHistory,
        },
        jobTemplates: action.payload.jobTemplates,
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
    case WorkflowsActions.EXPORT_WORKFLOWS:
      return {
        ...state,
        loading: true,
      };
    case WorkflowsActions.EXPORT_WORKFLOWS_DONE:
      return {
        ...state,
        loading: false,
      };
    case WorkflowsActions.SET_WORKFLOW_FILE:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflowFile: action.payload,
        },
      };
    case WorkflowsActions.IMPORT_WORKFLOW:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          mode: workflowModes.IMPORT,
          loading: true,
        },
      };
    case WorkflowsActions.IMPORT_WORKFLOW_FAILURE:
      return {
        ...state,
        workflowAction: {
          ...state.workflowAction,
          workflow: undefined,
          workflowFile: undefined,
          loading: false,
        },
      };
    case WorkflowsActions.IMPORT_WORKFLOWS:
      return {
        ...state,
        loading: true,
      };
    case WorkflowsActions.IMPORT_WORKFLOWS_SUCCESS: {
      const projects = sortProjects([...addWorkflow(action.payload, state.projects)]);
      return {
        ...state,
        loading: false,
        projects: [...projects],
      };
    }
    case WorkflowsActions.IMPORT_WORKFLOWS_FAILURE:
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
}

export function sortProjects(projects: ProjectModel[]): ProjectModel[] {
  let sortedProjects = projects.sort((projectLeft, projectRight) => projectLeft.name.localeCompare(projectRight.name));
  sortedProjects = [...sortedProjects].map((project: ProjectModel) => {
    const sortedWorkflows = [...project.workflows].sort((workflowLeft, workflowRight) =>
      workflowLeft.name.localeCompare(workflowRight.name),
    );
    return { ...project, workflows: sortedWorkflows };
  });
  return sortedProjects;
}

export function addWorkflow(workflows: WorkflowModel[], projects: ProjectModel[]): ProjectModel[] {
  let updatedProjects = [...projects];
  workflows.forEach((workflow) => {
    if (updatedProjects.some((project) => project.name == workflow.project)) {
      updatedProjects = updatedProjects.map((project) =>
        project.name == workflow.project
          ? { ...project, workflows: [...project.workflows, WorkflowIdentityModelFactory.create(workflow.id, workflow.name)] }
          : project,
      );
    } else {
      updatedProjects = [
        ...updatedProjects,
        ProjectModelFactory.create(workflow.project, [WorkflowIdentityModelFactory.create(workflow.id, workflow.name)]),
      ];
    }
  });
  return updatedProjects;
}
