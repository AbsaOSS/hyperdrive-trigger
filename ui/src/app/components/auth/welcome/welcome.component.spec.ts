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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms';
import { WelcomeComponent } from './welcome.component';
import * as fromApp from '../../../stores/app.reducers';
import { RouterTestingModule } from '@angular/router/testing';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let mockStore: MockStore<fromApp.AppState>;
  const initialAuthState = {
    username: 'test',
    isAuthenticated: false,
    authenticationFailed: false,
    showLoginDialog: false,
  };

  const initialAppState = {
    auth: initialAuthState,
    runs: {},
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [provideMockStore({ initialState: initialAppState })],
        declarations: [WelcomeComponent],
        imports: [RouterTestingModule, ClarityModule, FormsModule],
      }).compileComponents();

      mockStore = TestBed.inject(MockStore);
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
