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
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import * as AuthActions from './auth.actions';
import { switchMap, tap, mergeMap, catchError } from 'rxjs/operators';
import { absoluteRoutes } from '../../constants/routes.constants';

@Injectable()
export class AuthEffects {
  constructor(private actions: Actions, private authService: AuthService, private router: Router) {}

  authLogin = createEffect(() => {
    return this.actions.pipe(
      ofType(AuthActions.LOGIN),
      switchMap((login: AuthActions.Login) => {
        return this.authService.login(login.payload.username, login.payload.password).pipe(
          mergeMap((token: string) => {
            return this.authService.getUserInfo().pipe(
              mergeMap((username: string) => {
                return [
                  {
                    type: AuthActions.LOGIN_SUCCESS,
                    payload: { token: token, username: username },
                  },
                ];
              }),
            );
          }),
          catchError(() => {
            return [
              {
                type: AuthActions.LOGIN_FAILURE,
              },
            ];
          }),
        );
      }),
    );
  });

  logOut = createEffect(() => {
    return this.actions.pipe(
      ofType(AuthActions.LOGOUT),
      switchMap(() => this.authService.logout()),
      mergeMap(() => [{ type: AuthActions.LOGOUT_SUCCESS }]),
    );
  });

  logOutSuccess = createEffect(
    () => {
      return this.actions.pipe(
        ofType(AuthActions.LOGOUT_SUCCESS),
        tap(() => {
          this.router.navigateByUrl(absoluteRoutes.WELCOME);
        }),
      );
    },
    { dispatch: false },
  );
}
