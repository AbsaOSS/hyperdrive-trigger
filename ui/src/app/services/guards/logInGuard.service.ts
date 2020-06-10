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

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState } from '../../stores/app.reducers';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { absoluteRoutes } from '../../constants/routes.constants';

@Injectable()
export class LogInGuardService implements CanActivate {
  constructor(private store: Store<AppState>, public router: Router) {}

  canActivate(): Observable<boolean> {
    return this.store.select(selectAuthState).pipe(
      take(1),
      map((state) => {
        if (state.isAuthenticated) {
          this.router.navigateByUrl(absoluteRoutes.DEFAULT);
          return false;
        }
        return true;
      }),
    );
  }
}
