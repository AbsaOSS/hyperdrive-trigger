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

export interface State {
  jobTemplates: JobTemplateModel[];
  total: number;
  page: number;
  loading: boolean;
}

const initialState: State = {
  jobTemplates: [],
  total: 0,
  page: 1,
  loading: false,
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
  }
}
