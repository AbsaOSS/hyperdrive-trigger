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

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as RunActions from '../runs/runs.actions';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';
import { DagRunService } from '../../services/dagRun/dag-run.service';
import { JobInstanceModel } from '../../models/jobInstance.model';
import { DagRunModel } from '../../models/dagRuns/dagRun.model';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';

@Injectable()
export class RunsEffects {
  constructor(private actions: Actions, private dagRunService: DagRunService) {}

  @Effect({ dispatch: true })
  runsGet = this.actions.pipe(
    ofType(RunActions.GET_DAG_RUNS),
    switchMap((action: RunActions.GetDagRuns) => {
      return this.dagRunService.searchDagRuns(action.payload).pipe(
        mergeMap((searchResult: TableSearchResponseModel<DagRunModel>) => {
          return [
            {
              type: RunActions.GET_DAG_RUNS_SUCCESS,
              payload: { dagRuns: searchResult },
            },
          ];
        }),
        catchError(() => {
          return [
            {
              type: RunActions.GET_DAG_RUNS_FAILURE,
            },
          ];
        }),
      );
    }),
  );

  @Effect({ dispatch: true })
  runDetailGet = this.actions.pipe(
    ofType(RunActions.GET_DAG_RUN_DETAIL),
    switchMap((action: RunActions.GetDagRunDetail) => {
      return this.dagRunService.getDagRunDetails(action.payload).pipe(
        mergeMap((jobInstance: JobInstanceModel[]) => {
          return [
            {
              type: RunActions.GET_DAG_RUN_DETAIL_SUCCESS,
              payload: jobInstance.sort((jobInstanceA, jobInstanceB) => jobInstanceA.order - jobInstanceB.order),
            },
          ];
        }),
        catchError(() => {
          return [
            {
              type: RunActions.GET_DAG_RUN_DETAIL_FAILURE,
            },
          ];
        }),
      );
    }),
  );
}
