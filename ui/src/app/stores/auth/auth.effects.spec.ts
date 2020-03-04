import {TestBed} from '@angular/core/testing';

import {provideMockActions} from '@ngrx/effects/testing';
import {AuthEffects} from './auth.effects';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {Actions} from '@ngrx/effects';
import {AuthService} from '../../services/auth/auth.service';
import * as AuthActions from "./auth.actions";
import {Login, LoginSuccess, Logout, LogoutSuccess} from './auth.actions';
import {cold} from 'jasmine-marbles';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {absoluteRoutes} from '../../constants/routes.constants';
import {localStorageKeys} from '../../constants/localStorage.constants';
import {routeNames} from '../../constants/routes.constants';

describe('AuthEffects', () => {
  let underTest: AuthEffects;
  let authService: AuthService;
  let mockActions: Observable<any>;
  let router: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        AuthService,
        provideMockActions(() => mockActions),
      ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ]
    });
    underTest = TestBed.inject(AuthEffects);
    authService = TestBed.inject(AuthService);
    mockActions = TestBed.inject(Actions);
    router = TestBed.inject(Router);

    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve());
  });

  describe('authLogin', () => {
    it ('should return username and token', () => {
      const action = new Login({ username: 'test', password: 'pass' });
      mockActions = cold('-a', { a: action });
      const loginResponse = cold('-a|', { a: '1234' });
      const userInfoResponse = cold('-a|', { a: 'the-username' });
      const expected = cold('---a', { a: {
        type: AuthActions.LOGIN_SUCCESS,
        payload: { username: 'the-username', token: '1234' }
      }});

      spyOn(authService, 'login').and.returnValue(loginResponse);
      spyOn(authService, 'getUserInfo').and.returnValue(userInfoResponse);

      expect(underTest.authLogin).toBeObservable(expected);
    });

    it ('should return login failure if authService.login responds with an error', () => {
      const action = new Login({ username: 'test', password: 'pass' });
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|');
      spyOn(authService, 'login').and.returnValue(errorResponse);

      const expected = cold('--a', { a: {
          type: AuthActions.LOGIN_FAILURE
        }});
      expect(underTest.authLogin).toBeObservable(expected);
    });

    it ('should return login failure if authService.getUserInfo responds with an error', () => {
      const action = new Login({ username: 'test', password: 'pass' });
      mockActions = cold('-a', { a: action });
      const loginResponse = cold('-a|', { a: '1234' });
      const errorResponse = cold('-#|');
      spyOn(authService, 'login').and.returnValue(loginResponse);
      spyOn(authService, 'getUserInfo').and.returnValue(errorResponse);

      const expected = cold('---a', { a: {
          type: AuthActions.LOGIN_FAILURE
        }});
      expect(underTest.authLogin).toBeObservable(expected);
    });

    it ('should successfully return a request after a failed one', () => {
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
          type: AuthActions.LOGIN_FAILURE
        },
        b: {
          type: AuthActions.LOGIN_SUCCESS,
          payload: { username: 'the-username', token: '1234' }
        }
      });
      expect(underTest.authLogin).toBeObservable(expected);
    });
  });

  describe('logInSuccess', () => {
    it ('should store username and navigate to home', () => {
      spyOn(localStorage, 'setItem');
      const action = new LoginSuccess({username: 'test', token: '1234'});
      mockActions = cold('-a', {a: action});

      expect(underTest.logInSuccess).toBeObservable(mockActions);
      expect(router.navigateByUrl).toHaveBeenCalledWith(absoluteRoutes.DEFAULT);
      expect(localStorage.setItem).toHaveBeenCalledWith(localStorageKeys.USERNAME, 'test');
      expect(localStorage.setItem).toHaveBeenCalledWith(localStorageKeys.CSRF_TOKEN, '1234');
    });
  });

  describe('logOut', () => {
    it ('should return a LogoutSuccess', () => {
      const action = new Logout();
      mockActions = cold('-a', { a: action });
      const logoutResponse = cold('-a|', { });
      spyOn(authService, 'logout').and.returnValue(logoutResponse);

      const expected = cold('--a', { a: {
          type: AuthActions.LOGOUT_SUCCESS
        }});
      expect(underTest.logOut).toBeObservable(expected);
    });

    it ('should not fail if authService.logout returns a failure', () => {
      const action = new Logout();
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|', { });
      spyOn(authService, 'logout').and.returnValue(errorResponse);

      const expected = cold('--a', { a: {
          type: AuthActions.LOGOUT_SUCCESS
        }});
      expect(underTest.logOut).toBeObservable(expected);
    });
  });

  describe('logOutSuccess', () => {
    it ('should remove username from storage and navigate to login page', () => {
      spyOn(localStorage, 'removeItem');
      const action = new LogoutSuccess();
      mockActions = cold('-a', {a: action});

      expect(underTest.logOutSuccess).toBeObservable(mockActions);
      expect(router.navigateByUrl).toHaveBeenCalledWith(absoluteRoutes.LOGIN);
      expect(localStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.USERNAME);
      expect(localStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.CSRF_TOKEN);
    });
  });

});
