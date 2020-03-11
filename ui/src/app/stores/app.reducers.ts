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

import {ActionReducerMap, createFeatureSelector} from '@ngrx/store';
import * as fromAuth from "./auth/auth.reducers";
import * as fromRuns from "./runs/runs.reducers";
import {authReducer} from "./auth/auth.reducers";
import {runsReducer} from "./runs/runs.reducers";

export const authKey = 'auth';
export const runsKey = 'runs';

export interface AppState {
  [authKey]: fromAuth.State;
  [runsKey]: fromRuns.State;
}

export const reducers: ActionReducerMap<AppState> = {
  [authKey]: authReducer,
  [runsKey]: runsReducer
};

export const selectAuthState = createFeatureSelector<AppState, fromAuth.State>(authKey);
