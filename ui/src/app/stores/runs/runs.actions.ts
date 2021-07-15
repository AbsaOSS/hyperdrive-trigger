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
import { JobInstanceModel } from '../../models/jobInstance.model';
import { DagRunModel } from '../../models/dagRuns/dagRun.model';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';

export const GET_DAG_RUNS = 'GET_DAG_RUNS';
export const GET_DAG_RUNS_SUCCESS = 'GET_DAG_RUNS_SUCCESS';
export const GET_DAG_RUNS_FAILURE = 'GET_DAG_RUNS_FAILURE';

export const GET_DAG_RUN_DETAIL = 'GET_DAG_RUN_DETAIL';
export const GET_DAG_RUN_DETAIL_SUCCESS = 'GET_DAG_RUN_DETAIL_SUCCESS';
export const GET_DAG_RUN_DETAIL_FAILURE = 'GET_DAG_RUN_DETAIL_FAILURE';

export const KILL_JOB = 'KILL_JOB';

export class GetDagRuns implements Action {
  readonly type = GET_DAG_RUNS;
  constructor(public payload: TableSearchRequestModel) {}
}

export class GetDagRunsSuccess implements Action {
  readonly type = GET_DAG_RUNS_SUCCESS;
  constructor(public payload: { dagRuns: TableSearchResponseModel<DagRunModel> }) {}
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

export class KillJob implements Action {
  readonly type = KILL_JOB;
  constructor(public payload: { dagRunId: number; applicationId: string }) {}
}

export type RunsActions =
  | GetDagRuns
  | GetDagRunsSuccess
  | GetDagRunsFailure
  | GetDagRunDetail
  | GetDagRunDetailSuccess
  | GetDagRunDetailFailure
  | KillJob;
