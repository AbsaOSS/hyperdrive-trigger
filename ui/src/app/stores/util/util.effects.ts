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
import * as QuartzActions from '../util/util.actions';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';
import { UtilService } from '../../services/util/util.service';
import { QuartzExpressionDetailModel } from '../../models/quartzExpressionDetail.model';

@Injectable()
export class UtilEffects {
  constructor(private actions: Actions, private utilService: UtilService) {}

  @Effect({ dispatch: true })
  quartzDetailGet = this.actions.pipe(
    ofType(QuartzActions.GET_QUARTZ_DETAIL),
    switchMap((action: QuartzActions.GetQuartzDetail) => {
      return this.utilService.getQuartzDetail(action.payload).pipe(
        mergeMap((quartzExpressionDetail: QuartzExpressionDetailModel[]) => {
          return [
            {
              type: QuartzActions.GET_QUARTZ_DETAIL_SUCCESS,
              payload: quartzExpressionDetail,
            },
          ];
        }),
        catchError(() => {
          return [
            {
              type: QuartzActions.GET_QUARTZ_DETAIL_FAILURE,
            },
          ];
        }),
      );
    }),
  );
}
