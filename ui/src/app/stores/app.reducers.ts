import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import * as fromAuth from "./auth/auth.reducers";
import {authReducer} from "./auth/auth.reducers";
import {environment} from "../../environments/environment";

export interface AppState {
  auth: fromAuth.State;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer
};
