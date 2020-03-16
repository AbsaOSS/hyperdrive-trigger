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
import {DagRunFilterResultModel} from "../../models/dagRuns/dagRunSearchResponse.model";
import {DagRunSearchRequestModel} from "../../models/dagRuns/dagRunSearchRequest.model";

export const GET_DAG_RUNS = 'GET_DAG_RUNS';
export const GET_DAG_RUNS_SUCCESS = 'GET_DAG_RUNS_SUCCESS';
export const GET_DAG_RUNS_FAILURE = 'GET_DAG_RUNS_FAILURE';


export class GetDagRuns implements Action {
  readonly type = GET_DAG_RUNS;
  constructor(public payload: DagRunSearchRequestModel) {}
}

export class GetDagRunsSuccess implements Action {
  readonly type = GET_DAG_RUNS_SUCCESS;
  constructor(public payload: {dagRuns: DagRunFilterResultModel}) {}
}

export class GetDagRunsFailure implements Action {
  readonly type = GET_DAG_RUNS_FAILURE;
}

export type RunsActions = GetDagRuns | GetDagRunsSuccess | GetDagRunsFailure;
