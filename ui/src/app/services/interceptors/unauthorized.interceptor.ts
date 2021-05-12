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
import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, first, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../stores/auth/auth.actions';
import * as fromApp from '../../stores/app.reducers';
import { api, SKIP_BASE_URL_INTERCEPTOR } from '../../constants/api.constants';
import { selectAuthState } from '../../stores/app.reducers';

@Injectable({
  providedIn: 'root',
})
export class UnauthorizedInterceptor implements HttpInterceptor {
  constructor(private store: Store<fromApp.AppState>, private httpClient: HttpClient) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((response: any) => {
        if (
          response instanceof HttpErrorResponse &&
          (response.status === 401 || response.status === 403) &&
          !this.isLoginUrl(response.url)
        ) {
          this.store.dispatch(new AuthActions.LogoutWithoutRedirect());
          return this.createRetryAfterAuthenticatedObservable(request);
        }
        return throwError(response);
      }),
    );
  }

  createRetryAfterAuthenticatedObservable(request: HttpRequest<any>): Observable<HttpEvent<any>> {
    const headers = request.headers.set(SKIP_BASE_URL_INTERCEPTOR, SKIP_BASE_URL_INTERCEPTOR);
    const newRequest = request.clone({ headers });
    const requestRetrySubject: Subject<HttpEvent<any>> = new Subject<HttpEvent<any>>();
    this.store
      .select(selectAuthState)
      .pipe(first((state) => state.isAuthenticated))
      .subscribe(() => {
        this.httpClient
          .request(newRequest)
          .pipe(tap((response) => requestRetrySubject.next(response)))
          .subscribe();
      });
    return requestRetrySubject.asObservable();
  }

  isLoginUrl(responseUrl: string): boolean {
    return responseUrl.endsWith(api.LOGIN);
  }
}
