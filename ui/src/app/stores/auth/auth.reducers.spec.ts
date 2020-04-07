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

import {authReducer, State} from './auth.reducers';
import {Login, LoginFailure, LoginSuccess, Logout, LogoutSuccess} from './auth.actions';

describe('AuthReducers', () => {

  const initialState = {
    username: null,
    isAuthenticated: null,
    authenticationFailed: null
  } as State;

  function toState(dict: {}) {
    return dict as State;
  }

  it('should not change state on login', () => {
    const authAction = new Login({username: 'the-username', password: 'password'});

    const actual = authReducer(initialState, authAction);

    expect(actual).toEqual(initialState);
  });

  it('should set authenticated flag and username on login success', () => {
    const authAction = new LoginSuccess({username: 'the-username', token: '1234'});

    const actual = authReducer(initialState, authAction);

    expect(actual).toEqual(toState({
      username: 'the-username',
      isAuthenticated: true,
      authenticationFailed: null
    }));
  });

  it ('should set authentication failed flag on login failure', () => {
    const authAction = new LoginFailure();

    const actual = authReducer(initialState, authAction);

    expect(actual).toEqual(toState({
      username: null,
      isAuthenticated: null,
      authenticationFailed: true
    }));
  });

  it ('should not change state on logout', () => {
    const authAction = new Logout();

    const actual = authReducer(initialState, authAction);

    expect(actual).toEqual(initialState);
  });

  it ('should set authentication failed flag on logout success', () => {
    const state = {
      username: 'the-username',
      isAuthenticated: true,
      authenticationFailed: true
    } as State;
    const authAction = new LogoutSuccess();

    const actual = authReducer(state, authAction);

    expect(actual).toEqual(toState({
      username: null,
      isAuthenticated: false,
      authenticationFailed: false
    }));
  });
});
