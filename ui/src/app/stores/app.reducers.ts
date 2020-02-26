import {ActionReducerMap} from '@ngrx/store';
import * as fromAuth from "./auth/auth.reducers";
import * as fromRuns from "./runs/runs.reducers";
import {authReducer} from "./auth/auth.reducers";
import {runsReducer} from "./runs/runs.reducers";

export interface AppState {
  auth: fromAuth.State;
  runs: fromRuns.State;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  runs: runsReducer
};
