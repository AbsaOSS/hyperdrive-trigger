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
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as ApplicationActions from '../application/application.actions';

import { catchError, mergeMap, switchMap } from 'rxjs/operators';
import { AppInfoService } from '../../services/appInfo/appInfo.service';
import { AppInfoModel } from '../../models/appInfo.model';

@Injectable()
export class ApplicationEffects {
  constructor(private actions: Actions, private appInfoService: AppInfoService) {}

  appInfoLoad = createEffect(() => {
    return this.actions.pipe(
      ofType(ApplicationActions.LOAD_APP_INFO),
      switchMap(() => {
        return this.appInfoService.getAppInfo().pipe(
          mergeMap((appInfo: AppInfoModel) => {
            return [
              {
                type: ApplicationActions.LOAD_APP_INFO_SUCCESS,
                payload: appInfo,
              },
            ];
          }),
          catchError(() => {
            return [
              {
                type: ApplicationActions.LOAD_APP_INFO_FAILURE,
              },
            ];
          }),
        );
      }),
    );
  });
}
