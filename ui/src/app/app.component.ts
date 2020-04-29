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
import { selectAuthState } from './stores/app.reducers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  routes = absoluteRoutes;
  authStateSubscription: Subscription;
  isAuthenticated: boolean;
  username: string;

  constructor(private store: Store<fromApp.AppState>) {}

  ngOnInit(): void {
    this.authStateSubscription = this.store.select(selectAuthState).subscribe((state) => {
      this.isAuthenticated = state.isAuthenticated;
      this.username = state.username;
    });
  }

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
  }

  onLogOut() {
    this.store.dispatch(new AuthActions.Logout());
  }
}
