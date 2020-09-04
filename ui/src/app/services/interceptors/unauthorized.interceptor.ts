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
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../stores/auth/auth.actions';
import * as fromApp from '../../stores/app.reducers';
import { api } from '../../constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class UnauthorizedInterceptor implements HttpInterceptor {
  constructor(private store: Store<fromApp.AppState>) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((response: any) => {
        if (response instanceof HttpErrorResponse && response.status === 401 && !response.url.endsWith(api.LOGIN)) {
          if (this.isLogoutWithRedirect(response.url)) {
            this.store.dispatch(new AuthActions.LogoutWithoutRedirect());
          } else {
            this.store.dispatch(new AuthActions.LogoutSuccess());
          }
        }
        return throwError(response);
      }),
    );
  }

  isLogoutWithRedirect(responseUrl: string): boolean {
    const urlsForRedirect = [api.UPDATE_WORKFLOW, api.CREATE_WORKFLOW];
    return urlsForRedirect.some((urlForRedirect) => responseUrl.endsWith(urlForRedirect));
  }
}
