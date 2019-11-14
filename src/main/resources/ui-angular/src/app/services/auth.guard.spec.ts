/*
 * Copyright 2018-2019 ABSA Group Limited
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

import {TestBed, async, inject} from '@angular/core/testing';

import {AuthGuard} from './auth.guard';
import {Router, RouterStateSnapshot} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {AuthService} from './auth.service';
import createSpy = jasmine.createSpy;

describe('AuthGuard', () => {
  let underTest: AuthGuard;
  let mockAuthService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuard, AuthService],
      imports: [RouterTestingModule, HttpClientTestingModule]
    });

    underTest = TestBed.get(AuthGuard);
    mockAuthService = TestBed.get(AuthService);
    router = TestBed.get(Router);
  });

  it('should create', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));

  it('should return true if logged in', () => {
    // given
    mockAuthService.isLoggedIn = createSpy().and.returnValue(true);

    // when
    const canActivate = underTest.canActivate(null, null);

    // then
    expect(canActivate).toBe(true);
  });

  it('should redirect to the login page and return false if not logged in', () => {
    // given
    mockAuthService.isLoggedIn = createSpy().and.returnValue(false);
    router.navigate = createSpy();
    const routerStateSnapshot: RouterStateSnapshot = {root: null, url: 'backurl'};

    // when
    const canActivate = underTest.canActivate(null, routerStateSnapshot);

    // then
    expect(canActivate).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/signin'], {returnUrl: 'backurl'});
  });
});
