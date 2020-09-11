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
import { AppInfoModel } from '../../models/appInfo.model';

export const LOAD_APP_INFO = 'LOAD_APP_INFO';
export const LOAD_APP_INFO_SUCCESS = 'LOAD_APP_INFO_SUCCESS';
export const LOAD_APP_INFO_FAILURE = 'LOAD_APP_INFO_FAILURE';

export class LoadAppInfo implements Action {
  readonly type = LOAD_APP_INFO;
}

export class LoadAppInfoSuccess implements Action {
  readonly type = LOAD_APP_INFO_SUCCESS;
  constructor(public payload: AppInfoModel) {}
}

export class LoadAppInfoFailure implements Action {
  readonly type = LOAD_APP_INFO_FAILURE;
}

export type ApplicationActions = LoadAppInfo | LoadAppInfoSuccess | LoadAppInfoFailure;
