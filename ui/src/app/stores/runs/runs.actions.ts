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

import {Action} from "@ngrx/store";
import {DagRunsSearchResponseModel} from "../../models/dagRuns/dagRunsSearchResponse.model";
import {DagRunsSearchRequestModel} from "../../models/dagRuns/dagRunsSearchRequest.model";
import {JobInstanceModel} from "../../models/jobInstance.model";

export const GET_DAG_RUNS = 'GET_DAG_RUNS';
export const GET_DAG_RUNS_SUCCESS = 'GET_DAG_RUNS_SUCCESS';
export const GET_DAG_RUNS_FAILURE = 'GET_DAG_RUNS_FAILURE';

export const GET_DAG_RUN_DETAIL = 'GET_DAG_RUN_DETAIL';
export const GET_DAG_RUN_DETAIL_SUCCESS = 'GET_DAG_RUN_DETAIL_SUCCESS';
export const GET_DAG_RUN_DETAIL_FAILURE = 'GET_DAG_RUN_DETAIL_FAILURE';

export const SET_FILTER = 'SET_FILTER';
export const REMOVE_FILTERS = 'REMOVE_FILTERS';

export class GetDagRuns implements Action {
  readonly type = GET_DAG_RUNS;
  constructor(public payload: DagRunsSearchRequestModel) {}
}

export class GetDagRunsSuccess implements Action {
  readonly type = GET_DAG_RUNS_SUCCESS;
  constructor(public payload: {dagRuns: DagRunsSearchResponseModel}) {}
}

export class GetDagRunsFailure implements Action {
  readonly type = GET_DAG_RUNS_FAILURE;
}

export class GetDagRunDetail implements Action {
  readonly type = GET_DAG_RUN_DETAIL;
  constructor(public payload: number) {}
}

export class GetDagRunDetailSuccess implements Action {
  readonly type = GET_DAG_RUN_DETAIL_SUCCESS;
  constructor(public payload: JobInstanceModel[]) {}
}

export class GetDagRunDetailFailure implements Action {
  readonly type = GET_DAG_RUN_DETAIL_FAILURE;
}

export class SetFilter implements Action {
  readonly type = SET_FILTER;
  constructor(public payload: {property: string, value: any}) {}
}

export class RemoveFilters implements Action {
  readonly type = REMOVE_FILTERS;
}


export type RunsActions =
  GetDagRuns | GetDagRunsSuccess | GetDagRunsFailure |
  GetDagRunDetail | GetDagRunDetailSuccess | GetDagRunDetailFailure |
  SetFilter | RemoveFilters;
