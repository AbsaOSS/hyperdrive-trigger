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

import * as JobTemplatesActions from './job-templates.actions';
import { JobTemplateModel, JobTemplateModelFactory } from '../../models/jobTemplate.model';
import { HistoryModel } from '../../models/historyModel';
import { JobTemplateHistoryModel } from '../../models/jobTemplateHistoryModel';
import { WorkflowModel } from '../../models/workflow.model';

export interface State {
  jobTemplates: JobTemplateModel[];
  total: number;
  page: number;
  loading: boolean;
  jobTemplateAction: {
    id: number;
    loading: boolean;
    initialJobTemplate: JobTemplateModel;
    jobTemplate: JobTemplateModel;
    backendValidationErrors: string[];
  };
  usage: {
    loading: boolean;
    workflows: WorkflowModel[];
  };
  history: {
    loading: boolean;
    historyEntries: HistoryModel[];
    leftHistory: JobTemplateHistoryModel;
    rightHistory: JobTemplateHistoryModel;
  };
}

const initialState: State = {
  jobTemplates: [],
  total: 0,
  page: 1,
  loading: false,
  jobTemplateAction: {
    id: undefined,
    loading: true,
    initialJobTemplate: undefined,
    jobTemplate: undefined,
    backendValidationErrors: [],
  },
  usage: {
    loading: false,
    workflows: [],
  },
  history: {
    loading: true,
    historyEntries: [],
    leftHistory: undefined,
    rightHistory: undefined,
  },
};

export function jobTemplatesReducer(state: State = initialState, action: JobTemplatesActions.JobTemplatesActions) {
  switch (action.type) {
    case JobTemplatesActions.SEARCH_JOB_TEMPLATES:
      return { ...state, loading: true };
    case JobTemplatesActions.SEARCH_JOB_TEMPLATES_SUCCESS:
      return {
        ...state,
        loading: false,
        total: action.payload.jobTemplatesSearchResponse.total,
        jobTemplates: action.payload.jobTemplatesSearchResponse.items,
      };
    case JobTemplatesActions.SEARCH_JOB_TEMPLATES_FAILURE:
      return { ...initialState, loading: false };
    case JobTemplatesActions.GET_JOB_TEMPLATE_FOR_FORM:
      return {
        ...state,
        jobTemplateAction: {
          ...initialState.jobTemplateAction,
          id: action.payload,
          loading: true,
        },
      };
    case JobTemplatesActions.SET_JOB_TEMPLATE_FOR_FORM:
      return {
        ...state,
        jobTemplateAction: {
          ...state.jobTemplateAction,
          loading: false,
          initialJobTemplate: action.payload,
          jobTemplate: action.payload,
        },
      };
    case JobTemplatesActions.GET_JOB_TEMPLATE_FOR_FORM_FAILURE:
      return {
        ...state,
        jobTemplateAction: {
          ...initialState.jobTemplateAction,
          loading: false,
        },
      };
    case JobTemplatesActions.GET_JOB_TEMPLATE_USAGE:
      return {
        ...state,
        usage: {
          loading: true,
          workflows: [],
        },
      };
    case JobTemplatesActions.GET_JOB_TEMPLATE_USAGE_SUCCESS:
      return {
        ...state,
        usage: {
          loading: false,
          workflows: action.payload,
        },
      };
    case JobTemplatesActions.GET_JOB_TEMPLATE_USAGE_FAILURE:
      return {
        ...state,
        usage: {
          loading: false,
          workflows: [],
        },
      };
    case JobTemplatesActions.JOB_TEMPLATE_CHANGED:
      return {
        ...state,
        jobTemplateAction: {
          ...state.jobTemplateAction,
          jobTemplate: action.payload,
        },
      };
    case JobTemplatesActions.SET_EMPTY_JOB_TEMPLATE:
      return {
        ...state,
        jobTemplateAction: {
          ...initialState.jobTemplateAction,
          initialJobTemplate: JobTemplateModelFactory.createEmpty(),
          jobTemplate: JobTemplateModelFactory.createEmpty(),
          loading: false,
        },
      };
    case JobTemplatesActions.REMOVE_JOB_TEMPLATE_BACKEND_VALIDATION_ERROR:
      return {
        ...state,
        jobTemplateAction: {
          ...initialState.jobTemplateAction,
          loading: false,
          backendValidationErrors: [
            ...state.jobTemplateAction.backendValidationErrors.slice(0, action.payload),
            ...state.jobTemplateAction.backendValidationErrors.slice(action.payload + 1),
          ],
        },
      };
    case JobTemplatesActions.CREATE_JOB_TEMPLATE:
    case JobTemplatesActions.UPDATE_JOB_TEMPLATE:
      return {
        ...state,
        jobTemplateAction: {
          ...state.jobTemplateAction,
          loading: true,
        },
      };
    case JobTemplatesActions.CREATE_JOB_TEMPLATE_SUCCESS:
    case JobTemplatesActions.UPDATE_JOB_TEMPLATE_SUCCESS:
      return {
        ...state,
        jobTemplateAction: {
          ...state.jobTemplateAction,
          loading: false,
          initialJobTemplate: action.payload,
          jobTemplate: action.payload,
        },
      };
    case JobTemplatesActions.CREATE_JOB_TEMPLATE_FAILURE:
    case JobTemplatesActions.UPDATE_JOB_TEMPLATE_FAILURE:
      return {
        ...state,
        jobTemplateAction: {
          ...state.jobTemplateAction,
          backendValidationErrors: action.payload,
          loading: false,
        },
      };
    case JobTemplatesActions.DELETE_JOB_TEMPLATE:
      return {
        ...state,
        jobTemplateAction: {
          ...initialState.jobTemplateAction,
          id: action.payload,
          loading: true,
        },
      };
    case JobTemplatesActions.DELETE_JOB_TEMPLATE_SUCCESS:
      return {
        ...state,
        jobTemplates: state.jobTemplates.filter((jobTemplate) => jobTemplate.id != action.payload),
        jobTemplateAction: {
          ...state.jobTemplateAction,
          initialJobTemplate: undefined,
          jobTemplate: undefined,
          loading: false,
          id: action.payload,
        },
      };
    case JobTemplatesActions.DELETE_JOB_TEMPLATE_FAILURE:
      return {
        ...state,
        jobTemplateAction: {
          ...initialState.jobTemplateAction,
          loading: false,
        },
      };
    case JobTemplatesActions.LOAD_HISTORY_FOR_JOB_TEMPLATE:
      return {
        ...state,
        history: {
          ...initialState.history,
          loading: true,
        },
      };
    case JobTemplatesActions.LOAD_HISTORY_FOR_JOB_TEMPLATE_SUCCESS:
      return {
        ...state,
        history: {
          ...state.history,
          loading: false,
          historyEntries: action.payload,
        },
      };
    case JobTemplatesActions.LOAD_HISTORY_FOR_JOB_TEMPLATE_FAILURE:
      return {
        ...state,
        history: {
          ...initialState.history,
          loading: false,
        },
      };
    case JobTemplatesActions.LOAD_JOB_TEMPLATES_FROM_HISTORY:
      return {
        ...state,
        history: {
          ...initialState.history,
          loading: true,
        },
      };
    case JobTemplatesActions.LOAD_JOB_TEMPLATES_FROM_HISTORY_SUCCESS:
      return {
        ...state,
        history: {
          ...state.history,
          loading: false,
          leftHistory: action.payload.leftHistory,
          rightHistory: action.payload.rightHistory,
        },
      };
    case JobTemplatesActions.LOAD_JOB_TEMPLATES_FROM_HISTORY_FAILURE:
      return {
        ...state,
        history: {
          ...initialState.history,
          loading: false,
        },
      };
    default:
      return state;
  }
}
