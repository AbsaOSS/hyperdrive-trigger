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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectApplicationState, selectAuthState } from '../../../stores/app.reducers';
import { Login } from '../../../stores/auth/auth.actions';
import { Subscription } from 'rxjs';
import { AppInfoModel } from '../../../models/appInfo.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  @Input() styleClass = '';
  authStateSubscription: Subscription;
  applicationStateSubscription: Subscription;
  authenticationFailed = false;
  username = '';
  password = '';
  appInfo: AppInfoModel;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.applicationStateSubscription = this.store.select(selectApplicationState).subscribe((state) => {
      this.appInfo = state.appInfo;
    });
    this.authStateSubscription = this.store.select(selectAuthState).subscribe((state) => {
      this.authenticationFailed = state.authenticationFailed;
    });
  }

  ngOnDestroy(): void {
    !!this.authStateSubscription && this.authStateSubscription.unsubscribe();
    !!this.applicationStateSubscription && this.applicationStateSubscription.unsubscribe();
  }

  onSubmit() {
    this.store.dispatch(new Login({ username: this.username, password: this.password }));
  }
}
