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

import { TestBed } from '@angular/core/testing';

import { provideMockActions } from '@ngrx/effects/testing';
import { AuthEffects } from './auth.effects';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Actions } from '@ngrx/effects';
import { AuthService } from '../../services/auth/auth.service';
import * as AuthActions from './auth.actions';
import { Login, Logout, LogoutSuccess } from './auth.actions';
import { cold } from 'jasmine-marbles';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { absoluteRoutes } from '../../constants/routes.constants';

describe('AuthEffects', () => {
  let underTest: AuthEffects;
  let authService: AuthService;
  let mockActions: Observable<any>;
  let router: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthEffects, AuthService, provideMockActions(() => mockActions)],
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    underTest = TestBed.inject(AuthEffects);
    authService = TestBed.inject(AuthService);
    mockActions = TestBed.inject(Actions);
    router = TestBed.inject(Router);

    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve());
  });

  describe('authLogin', () => {
    it('should return username and token', () => {
      const action = new Login({ username: 'test', password: 'pass' });
      mockActions = cold('-a', { a: action });
      const loginResponse = cold('-a|', { a: '1234' });
      const userInfoResponse = cold('-a|', { a: 'the-username' });
      const expected = cold('---a', {
        a: {
          type: AuthActions.LOGIN_SUCCESS,
          payload: { username: 'the-username', token: '1234' },
        },
      });

      spyOn(authService, 'login').and.returnValue(loginResponse);
      spyOn(authService, 'getUserInfo').and.returnValue(userInfoResponse);

      expect(underTest.authLogin).toBeObservable(expected);
    });

    it('should return login failure if authService.login responds with an error', () => {
      const action = new Login({ username: 'test', password: 'pass' });
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|');
      spyOn(authService, 'login').and.returnValue(errorResponse);

      const expected = cold('--a', {
        a: {
          type: AuthActions.LOGIN_FAILURE,
        },
      });
      expect(underTest.authLogin).toBeObservable(expected);
    });

    it('should return login failure if authService.getUserInfo responds with an error', () => {
      const action = new Login({ username: 'test', password: 'pass' });
      mockActions = cold('-a', { a: action });
      const loginResponse = cold('-a|', { a: '1234' });
      const errorResponse = cold('-#|');
      spyOn(authService, 'login').and.returnValue(loginResponse);
      spyOn(authService, 'getUserInfo').and.returnValue(errorResponse);

      const expected = cold('---a', {
        a: {
          type: AuthActions.LOGIN_FAILURE,
        },
      });
      expect(underTest.authLogin).toBeObservable(expected);
    });

    it('should successfully return a request after a failed one', () => {
      const failingAction = new Login({ username: 'fail', password: 'pass' });
      const successfulAction = new Login({ username: 'success', password: 'pass' });
      mockActions = cold('a----b', { a: failingAction, b: successfulAction });
      const errorResponse = cold('#|');
      const loginResponse = cold('a|', { a: '1234' });
      const userInfoResponse = cold('a|', { a: 'the-username' });

      spyOn(authService, 'login').and.returnValues(errorResponse, loginResponse);
      spyOn(authService, 'getUserInfo').and.returnValue(userInfoResponse);

      const expected = cold('a----b', {
        a: {
          type: AuthActions.LOGIN_FAILURE,
        },
        b: {
          type: AuthActions.LOGIN_SUCCESS,
          payload: { username: 'the-username', token: '1234' },
        },
      });
      expect(underTest.authLogin).toBeObservable(expected);
    });
  });

  describe('logOut', () => {
    it('should return a LogoutSuccess', () => {
      const action = new Logout();
      mockActions = cold('-a', { a: action });
      const logoutResponse = cold('-a|', {});
      spyOn(authService, 'logout').and.returnValue(logoutResponse);

      const expected = cold('--a', {
        a: {
          type: AuthActions.LOGOUT_SUCCESS,
        },
      });
      expect(underTest.logOut).toBeObservable(expected);
    });

    it('should return a failure if authService.logout returns a failure', () => {
      const action = new Logout();
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|', {});
      spyOn(authService, 'logout').and.returnValue(errorResponse);

      const expected = cold('--#', {});
      expect(underTest.logOut).toBeObservable(expected);
    });
  });

  describe('logOutSuccess', () => {
    it('should remove username from storage and navigate to login page', () => {
      const action = new LogoutSuccess();
      mockActions = cold('-a', { a: action });

      expect(underTest.logOutSuccess).toBeObservable(mockActions);
      expect(router.navigateByUrl).toHaveBeenCalledWith(absoluteRoutes.WELCOME);
    });
  });
});
