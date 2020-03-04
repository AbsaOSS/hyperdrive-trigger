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
