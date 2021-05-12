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
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SKIP_BASE_URL_INTERCEPTOR } from '../../constants/api.constants';

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.headers.has(SKIP_BASE_URL_INTERCEPTOR)) {
      const headers = req.headers.delete(SKIP_BASE_URL_INTERCEPTOR);
      const newRequest = req.clone({ headers });
      return next.handle(newRequest);
    } else {
      let baseUrl = window.location.pathname;
      if (baseUrl[baseUrl.length - 1] === '/' && req.url[0] === '/') {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1);
      } else if (baseUrl[baseUrl.length - 1] !== '/' && req.url[0] !== '/') {
        baseUrl = baseUrl + '/';
      }
      const apiReq = req.clone({ url: `${baseUrl}${req.url}` });
      return next.handle(apiReq);
    }
  }
}
