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
import { JobTemplateFormEntryModel } from '../../models/jobTemplateFormEntry.model';

export const SEARCH_JOB_TEMPLATES = 'SEARCH_JOB_TEMPLATES';
export const SEARCH_JOB_TEMPLATES_SUCCESS = 'SEARCH_JOB_TEMPLATES_SUCCESS';
export const SEARCH_JOB_TEMPLATES_FAILURE = 'SEARCH_JOB_TEMPLATES_FAILURE';
export const GET_JOB_TEMPLATE_FOR_FORM = 'GET_JOB_TEMPLATE_FOR_FORM';
export const SET_JOB_TEMPLATE_FOR_FORM = 'SET_JOB_TEMPLATE_FOR_FORM';
export const SET_JOB_TEMPLATE_PARTS_FOR_FORM = 'SET_JOB_TEMPLATE_PARTS_FOR_FORM';
export const GET_JOB_TEMPLATE_FOR_FORM_FAILURE = 'GET_JOB_TEMPLATE_FOR_FORM_FAILURE';

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

export class SetJobTemplatePartsForFrom implements Action {
  readonly type = SET_JOB_TEMPLATE_PARTS_FOR_FORM;
  constructor(public payload: JobTemplateFormEntryModel[]) {}
}

export class GetJobTemplateForFormFailure implements Action {
  readonly type = GET_JOB_TEMPLATE_FOR_FORM_FAILURE;
}

export type JobTemplatesActions =
  | SearchJobTemplates
  | SearchJobTemplatesSuccess
  | SearchJobTemplatesFailure
  | GetJobTemplateForForm
  | SetJobTemplateForFrom
  | SetJobTemplatePartsForFrom
  | GetJobTemplateForFormFailure;
