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
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { localStorageKeys } from '../../constants/localStorage.constants';

@Injectable({ providedIn: 'root' })
export class CsrfInterceptor implements HttpInterceptor {
  constructor() {
    // do nothing
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const csrfToken = localStorage.getItem(localStorageKeys.CSRF_TOKEN);
    if (request.method !== 'GET' && csrfToken) {
      request = request.clone({ setHeaders: { 'X-CSRF-TOKEN': csrfToken } });
    }
    return next.handle(request);
  }
}
