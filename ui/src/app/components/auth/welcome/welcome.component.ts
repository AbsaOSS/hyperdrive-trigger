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
import { AppState, selectAuthState } from '../../../stores/app.reducers';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { absoluteRoutes } from '../../../constants/routes.constants';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit, OnDestroy {
  authStateSubscription: Subscription;

  constructor(private store: Store<AppState>, private router: Router) {}

  ngOnInit(): void {
    this.authStateSubscription = this.store.select(selectAuthState).subscribe((state) => {
      if (state.isAuthenticated) {
        this.router.navigateByUrl(absoluteRoutes.DEFAULT);
      }
    });
  }

  ngOnDestroy(): void {
    !!this.authStateSubscription && this.authStateSubscription.unsubscribe();
  }
}
