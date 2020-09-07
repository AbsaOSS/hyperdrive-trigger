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

import * as AuthActions from './auth.actions';
import { localStorageKeys } from '../../constants/localStorage.constants';

export interface State {
  username: string;
  isAuthenticated: boolean;
  authenticationFailed: boolean;
  showLoginDialog: boolean;
}

const initialState: State = {
  username: localStorage.getItem(localStorageKeys.USERNAME),
  isAuthenticated: !!localStorage.getItem(localStorageKeys.CSRF_TOKEN),
  authenticationFailed: false,
  showLoginDialog: false,
};

function clearAuthentication() {
  localStorage.removeItem(localStorageKeys.CSRF_TOKEN);
  localStorage.removeItem(localStorageKeys.USERNAME);
}

export function authReducer(state: State = initialState, action: AuthActions.AuthActions) {
  switch (action.type) {
    case AuthActions.LOGIN:
      return state;
    case AuthActions.LOGIN_SUCCESS:
      localStorage.setItem(localStorageKeys.CSRF_TOKEN, action.payload.token);
      localStorage.setItem(localStorageKeys.USERNAME, action.payload.username);
      return { ...state, isAuthenticated: true, username: action.payload.username, showLoginDialog: false };
    case AuthActions.LOGIN_FAILURE:
      return { ...state, authenticationFailed: true };
    case AuthActions.LOGOUT:
      return state;
    case AuthActions.LOGOUT_SUCCESS:
      clearAuthentication();
      return { ...state, isAuthenticated: false, username: null, authenticationFailed: false };
    case AuthActions.LOGOUT_WITHOUT_REDIRECT:
      clearAuthentication();
      return { ...state, isAuthenticated: false, username: null, authenticationFailed: false, showLoginDialog: true };
    default:
      return state;
  }
}
