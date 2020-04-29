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

import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ClarityModule } from '@clr/angular';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { AppComponent } from './app.component';
import * as fromApp from './stores/app.reducers';
import { selectAuthState } from './stores/app.reducers';

describe('AppComponent', () => {
  let mockStore: MockStore<fromApp.AppState>;
  const initialAuthState = {
    username: 'test-user',
    isAuthenticated: true,
    authenticationFailed: false,
  };

  const initialAppState = {
    auth: initialAuthState,
    runs: {},
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ClarityModule],
      providers: [provideMockStore({ initialState: initialAppState })],
      declarations: [AppComponent],
    }).compileComponents();

    mockStore = TestBed.inject(MockStore);
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the title and the username', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.title').textContent).toBe('Hyperdrive');
    expect(compiled.querySelector('.header-actions').textContent).toContain('test-user');
  });

  it('should render neither the title nor the username if the user is not authenticated', () => {
    const fixture = TestBed.createComponent(AppComponent);
    mockStore.overrideSelector(selectAuthState, { ...initialAuthState, isAuthenticated: false });
    mockStore.refreshState();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.title')).toBeFalsy();
    expect(compiled.querySelector('.header-actions')).toBeFalsy();
  });
});
