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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import * as AuthActions from './stores/auth/auth.actions';
import * as fromApp from './stores/app.reducers';
import { absoluteRoutes } from './constants/routes.constants';
import { selectAuthState, selectApplicationState } from './stores/app.reducers';
import { AppInfoModel } from './models/appInfo.model';
import { LoadAppInfo } from './stores/application/application.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  routes = absoluteRoutes;
  authStateSubscription: Subscription;
  applicationStateSubscription: Subscription;
  loading: boolean;
  isAuthenticated: boolean;
  username: string;
  appInfo: AppInfoModel;

  constructor(private store: Store<fromApp.AppState>, private router: Router) {
    this.store.dispatch(new LoadAppInfo());
  }

  ngOnInit(): void {
    this.applicationStateSubscription = this.store.select(selectApplicationState).subscribe((state) => {
      this.loading = state.loading;
      this.appInfo = state.appInfo;
    });
    this.authStateSubscription = this.store.select(selectAuthState).subscribe((state) => {
      this.isAuthenticated = state.isAuthenticated;
      this.username = state.username;
    });
  }

  onLogOut() {
    this.store.dispatch(new AuthActions.Logout());
  }

  public isActive(base: string): boolean {
    return this.router.url.includes(base);
  }

  ngOnDestroy(): void {
    !!this.authStateSubscription && this.authStateSubscription.unsubscribe();
    !!this.applicationStateSubscription && this.applicationStateSubscription.unsubscribe();
  }
}
