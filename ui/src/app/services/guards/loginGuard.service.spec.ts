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
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { cold } from 'jasmine-marbles';
import { RouterTestingModule } from '@angular/router/testing';
import { LogInGuardService } from './logInGuard.service';
import { absoluteRoutes } from '../../constants/routes.constants';
import { selectAuthState } from '../../stores/app.reducers';

describe('LoginGuard Service', () => {
  let underTest: LogInGuardService;
  let store: MockStore;
  const initialAuthState = {
    username: 'test',
    isAuthenticated: true,
    authenticationFailed: false,
    showLoginDialog: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LogInGuardService, provideMockStore()],
      imports: [RouterTestingModule],
    });

    store = TestBed.inject(MockStore);
    underTest = TestBed.inject(LogInGuardService);
    spyOn(underTest.router, 'navigateByUrl').and.returnValue(Promise.resolve(true));
  });

  it('should redirect and return false if the user is authenticated', () => {
    store.overrideSelector(selectAuthState, { ...initialAuthState, isAuthenticated: true });

    const expected = cold('(a|)', { a: false });
    expect(underTest.canActivate()).toBeObservable(expected);
    expect(underTest.router.navigateByUrl).toHaveBeenCalledWith(absoluteRoutes.DEFAULT);
  });

  it('should return true if the user is not authenticated', () => {
    store.overrideSelector(selectAuthState, { ...initialAuthState, isAuthenticated: false });

    const expected = cold('(a|)', { a: true });
    expect(underTest.canActivate()).toBeObservable(expected);
  });
});
