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

import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ClarityModule } from '@clr/angular';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { AppComponent } from './app.component';
import * as fromApp from './stores/app.reducers';
import { selectAuthState } from './stores/app.reducers';
import { Router } from '@angular/router';
import { AppInfoModelFactory } from './models/appInfo.model';

describe('AppComponent', () => {
  let underTest: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockStore: MockStore<fromApp.AppState>;
  let mockRouter: Router;

  const initialAuthState = {
    username: 'test-user',
    isAuthenticated: true,
    authenticationFailed: false,
    showLoginDialog: false,
  };

  const initialApplicationState = {
    loading: false,
    appInfo: AppInfoModelFactory.create('Undefined', 'Undefined', 'Undefined'),
  };

  const initialAppState = {
    application: initialApplicationState,
    auth: initialAuthState,
    runs: {},
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule, ClarityModule],
        providers: [provideMockStore({ initialState: initialAppState })],
        declarations: [AppComponent],
      }).compileComponents();

      mockStore = TestBed.inject(MockStore);
      mockRouter = TestBed.inject(Router);
      fixture = TestBed.createComponent(AppComponent);
      underTest = fixture.componentInstance;
    }),
  );

  it('should create the app', () => {
    fixture.detectChanges();

    expect(underTest).toBeTruthy();
  });

  it('should render the title and the username', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.title').textContent).toBe('Hyperdrive');
    expect(compiled.querySelectorAll('.header-actions')[1].textContent).toContain('test-user');
  });

  it('should render neither the title nor the username if the user is not authenticated', () => {
    mockStore.overrideSelector(selectAuthState, { ...initialAuthState, isAuthenticated: false });
    mockStore.refreshState();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.title')).toBeFalsy();
    expect(compiled.querySelector('.header-actions')).toBeFalsy();
  });

  it('isActive(base) should return true if current route contains base', () => {
    const urlBase = 'urlBase';
    const routerSpy = spyOnProperty(mockRouter, 'url', 'get').and.returnValue(`prefix/${urlBase}/suffix`);

    const result = underTest.isActive(urlBase);

    expect(routerSpy).toHaveBeenCalledTimes(1);
    expect(result).toBeTrue();
  });

  it('isActive(base) should return false if current route does not contain base', () => {
    const urlBase = 'urlBase';
    const routerSpy = spyOnProperty(mockRouter, 'url', 'get').and.returnValue(`prefix/suffix`);

    const result = underTest.isActive(urlBase);

    expect(routerSpy).toHaveBeenCalledTimes(1);
    expect(result).toBeFalse();
  });
});
