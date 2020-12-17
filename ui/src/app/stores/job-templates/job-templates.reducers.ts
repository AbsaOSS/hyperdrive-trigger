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
import { JobTemplateModel } from '../../models/jobTemplate.model';
import { JobTemplateFormEntryModel } from '../../models/jobTemplateFormEntry.model';

export interface State {
  jobTemplates: JobTemplateModel[];
  total: number;
  page: number;
  loading: boolean;
  jobTemplateAction: {
    id: number;
    loading: boolean;
    jobTemplate: JobTemplateModel;
    jobTemplateFormEntries: JobTemplateFormEntryModel[];
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
    jobTemplate: undefined,
    jobTemplateFormEntries: [],
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
          loading: true,
          jobTemplate: action.payload,
        },
      };
    case JobTemplatesActions.SET_JOB_TEMPLATE_PARTS_FOR_FORM:
      return {
        ...state,
        jobTemplateAction: {
          ...state.jobTemplateAction,
          loading: false,
          jobTemplateFormEntries: action.payload,
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
    default:
      return state;
  }
}
