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

import { Action } from '@ngrx/store';
import { TableSearchRequestModel } from '../../models/search/tableSearchRequest.model';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import { JobTemplateModel } from '../../models/jobTemplate.model';
import { HistoryModel } from '../../models/historyModel';
import { JobTemplateHistoryModel } from '../../models/jobTemplateHistoryModel';
import { WorkflowModel } from '../../models/workflow.model';

export const SEARCH_JOB_TEMPLATES = 'SEARCH_JOB_TEMPLATES';
export const SEARCH_JOB_TEMPLATES_SUCCESS = 'SEARCH_JOB_TEMPLATES_SUCCESS';
export const SEARCH_JOB_TEMPLATES_FAILURE = 'SEARCH_JOB_TEMPLATES_FAILURE';
export const GET_JOB_TEMPLATE_FOR_FORM = 'GET_JOB_TEMPLATE_FOR_FORM';
export const SET_JOB_TEMPLATE_FOR_FORM = 'SET_JOB_TEMPLATE_FOR_FORM';
export const GET_JOB_TEMPLATE_FOR_FORM_FAILURE = 'GET_JOB_TEMPLATE_FOR_FORM_FAILURE';

export const GET_JOB_TEMPLATE_USAGE = 'GET_JOB_TEMPLATE_USAGE';
export const GET_JOB_TEMPLATE_USAGE_SUCCESS = 'GET_JOB_TEMPLATE_USAGE_SUCCESS';
export const GET_JOB_TEMPLATE_USAGE_FAILURE = 'GET_JOB_TEMPLATE_USAGE_FAILURE';

export const JOB_TEMPLATE_CHANGED = 'JOB_TEMPLATE_CHANGED';
export const SET_EMPTY_JOB_TEMPLATE = 'SET_EMPTY_JOB_TEMPLATE';
export const REMOVE_JOB_TEMPLATE_BACKEND_VALIDATION_ERROR = 'REMOVE_JOB_TEMPLATE_BACKEND_VALIDATION_ERROR';

export const CREATE_JOB_TEMPLATE = 'CREATE_JOB_TEMPLATE';
export const CREATE_JOB_TEMPLATE_SUCCESS = 'CREATE_JOB_TEMPLATE_SUCCESS';
export const CREATE_JOB_TEMPLATE_FAILURE = 'CREATE_JOB_TEMPLATE_FAILURE';

export const UPDATE_JOB_TEMPLATE = 'UPDATE_JOB_TEMPLATE';
export const UPDATE_JOB_TEMPLATE_SUCCESS = 'UPDATE_JOB_TEMPLATE_SUCCESS';
export const UPDATE_JOB_TEMPLATE_FAILURE = 'UPDATE_JOB_TEMPLATE_FAILURE';

export const DELETE_JOB_TEMPLATE = 'DELETE_JOB_TEMPLATE';
export const DELETE_JOB_TEMPLATE_SUCCESS = 'DELETE_JOB_TEMPLATE_SUCCESS';
export const DELETE_JOB_TEMPLATE_FAILURE = 'DELETE_JOB_TEMPLATE_FAILURE';

export const LOAD_HISTORY_FOR_JOB_TEMPLATE = 'LOAD_HISTORY_FOR_JOB_TEMPLATE';
export const LOAD_HISTORY_FOR_JOB_TEMPLATE_SUCCESS = 'LOAD_HISTORY_FOR_JOB_TEMPLATE_SUCCESS';
export const LOAD_HISTORY_FOR_JOB_TEMPLATE_FAILURE = 'LOAD_HISTORY_FOR_JOB_TEMPLATE_FAILURE';

export const LOAD_JOB_TEMPLATES_FROM_HISTORY = 'LOAD_JOB_TEMPLATES_FROM_HISTORY';
export const LOAD_JOB_TEMPLATES_FROM_HISTORY_SUCCESS = 'LOAD_JOB_TEMPLATES_FROM_HISTORY_SUCCESS';
export const LOAD_JOB_TEMPLATES_FROM_HISTORY_FAILURE = 'LOAD_JOB_TEMPLATES_FROM_HISTORY_FAILURE';

export const REVERT_JOB_TEMPLATE = 'REVERT_JOB_TEMPLATE';
export const REVERT_JOB_TEMPLATE_SUCCESS = 'REVERT_JOB_TEMPLATE_SUCCESS';
export const REVERT_JOB_TEMPLATE_FAILURE = 'REVERT_JOB_TEMPLATE_FAILURE';

export class SearchJobTemplates implements Action {
  readonly type = SEARCH_JOB_TEMPLATES;
  constructor(public payload: TableSearchRequestModel) {}
}

export class SearchJobTemplatesSuccess implements Action {
  readonly type = SEARCH_JOB_TEMPLATES_SUCCESS;
  constructor(public payload: { jobTemplatesSearchResponse: TableSearchResponseModel<JobTemplateModel> }) {}
}

export class SearchJobTemplatesFailure implements Action {
  readonly type = SEARCH_JOB_TEMPLATES_FAILURE;
}

export class GetJobTemplateForForm implements Action {
  readonly type = GET_JOB_TEMPLATE_FOR_FORM;
  constructor(public payload: number) {}
}

export class SetJobTemplateForFrom implements Action {
  readonly type = SET_JOB_TEMPLATE_FOR_FORM;
  constructor(public payload: JobTemplateModel) {}
}

export class GetJobTemplateForFormFailure implements Action {
  readonly type = GET_JOB_TEMPLATE_FOR_FORM_FAILURE;
}

export class GetJobTemplateUsage implements Action {
  readonly type = GET_JOB_TEMPLATE_USAGE;
  constructor(public payload: number) {}
}

export class GetJobTemplateUsageSuccess implements Action {
  readonly type = GET_JOB_TEMPLATE_USAGE_SUCCESS;
  constructor(public payload: WorkflowModel[]) {}
}

export class GetJobTemplateUsageFailure implements Action {
  readonly type = GET_JOB_TEMPLATE_USAGE_FAILURE;
}

export class JobTemplateChanged implements Action {
  readonly type = JOB_TEMPLATE_CHANGED;
  constructor(public payload: JobTemplateModel) {}
}

export class SetEmptyJobTemplate implements Action {
  readonly type = SET_EMPTY_JOB_TEMPLATE;
}

export class RemoveJobTemplateBackendValidationError implements Action {
  readonly type = REMOVE_JOB_TEMPLATE_BACKEND_VALIDATION_ERROR;
  constructor(public payload: number) {}
}

export class CreateJobTemplate implements Action {
  readonly type = CREATE_JOB_TEMPLATE;
}

export class CreateJobTemplateSuccess implements Action {
  readonly type = CREATE_JOB_TEMPLATE_SUCCESS;
  constructor(public payload: JobTemplateModel) {}
}

export class CreateJobTemplateFailure implements Action {
  readonly type = CREATE_JOB_TEMPLATE_FAILURE;
  constructor(public payload: string[]) {}
}

export class UpdateJobTemplate implements Action {
  readonly type = UPDATE_JOB_TEMPLATE;
}

export class UpdateJobTemplateSuccess implements Action {
  readonly type = UPDATE_JOB_TEMPLATE_SUCCESS;
  constructor(public payload: JobTemplateModel) {}
}

export class UpdateJobTemplateFailure implements Action {
  readonly type = UPDATE_JOB_TEMPLATE_FAILURE;
  constructor(public payload: string[]) {}
}

export class DeleteJobTemplate implements Action {
  readonly type = DELETE_JOB_TEMPLATE;
  constructor(public payload: number) {}
}

export class DeleteJobTemplateSuccess implements Action {
  readonly type = DELETE_JOB_TEMPLATE_SUCCESS;
  constructor(public payload: number) {}
}

export class DeleteJobTemplateFailure implements Action {
  readonly type = DELETE_JOB_TEMPLATE_FAILURE;
}

export class LoadHistoryForJobTemplate implements Action {
  readonly type = LOAD_HISTORY_FOR_JOB_TEMPLATE;
  constructor(public payload: number) {}
}

export class LoadHistoryForJobTemplateSuccess implements Action {
  readonly type = LOAD_HISTORY_FOR_JOB_TEMPLATE_SUCCESS;
  constructor(public payload: HistoryModel[]) {}
}

export class LoadHistoryForJobTemplateFailure implements Action {
  readonly type = LOAD_HISTORY_FOR_JOB_TEMPLATE_FAILURE;
}

export class LoadJobTemplatesFromHistory implements Action {
  readonly type = LOAD_JOB_TEMPLATES_FROM_HISTORY;
  constructor(public payload: { leftHistoryId: number; rightHistoryId: number }) {}
}

export class LoadJobTemplatesFromHistorySuccess implements Action {
  readonly type = LOAD_JOB_TEMPLATES_FROM_HISTORY_SUCCESS;
  constructor(
    public payload: {
      leftHistory: JobTemplateHistoryModel;
      rightHistory: JobTemplateHistoryModel;
    },
  ) {}
}

export class LoadJobTemplatesFromHistoryFailure implements Action {
  readonly type = LOAD_JOB_TEMPLATES_FROM_HISTORY_FAILURE;
}

export class RevertJobTemplate implements Action {
  readonly type = REVERT_JOB_TEMPLATE;
  constructor(public payload: number) {}
}

export class RevertJobTemplateSuccess implements Action {
  readonly type = REVERT_JOB_TEMPLATE_SUCCESS;
  constructor(public payload: JobTemplateModel) {}
}

export class RevertJobTemplateFailure implements Action {
  readonly type = REVERT_JOB_TEMPLATE_FAILURE;
}

export type JobTemplatesActions =
  | SearchJobTemplates
  | SearchJobTemplatesSuccess
  | SearchJobTemplatesFailure
  | GetJobTemplateForForm
  | SetJobTemplateForFrom
  | GetJobTemplateForFormFailure
  | GetJobTemplateUsage
  | GetJobTemplateUsageSuccess
  | GetJobTemplateUsageFailure
  | JobTemplateChanged
  | SetEmptyJobTemplate
  | RemoveJobTemplateBackendValidationError
  | CreateJobTemplate
  | CreateJobTemplateSuccess
  | CreateJobTemplateFailure
  | UpdateJobTemplate
  | UpdateJobTemplateSuccess
  | UpdateJobTemplateFailure
  | DeleteJobTemplate
  | DeleteJobTemplateSuccess
  | DeleteJobTemplateFailure
  | LoadHistoryForJobTemplate
  | LoadHistoryForJobTemplateSuccess
  | LoadHistoryForJobTemplateFailure
  | LoadJobTemplatesFromHistory
  | LoadJobTemplatesFromHistorySuccess
  | LoadJobTemplatesFromHistoryFailure
  | RevertJobTemplate
  | RevertJobTemplateSuccess
  | RevertJobTemplateFailure;
