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
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { api } from '../../constants/api.constants';

@Injectable()
export class AuthService {
  static readonly csrfTokenHeaderId: string = 'X-CSRF-TOKEN';

  constructor(private httpClient: HttpClient) {}

  getUserInfo(): Observable<string> {
    return this.httpClient.get<{ username: string }>(api.USER_INFO, {}).pipe(map((_) => _.username));
  }

  login(username: string, password: string): Observable<string> {
    const body = new FormData();
    body.append('username', username);
    body.append('password', password);
    return this.httpClient
      .post(api.LOGIN, body, {
        observe: 'response',
      })
      .pipe(map((_) => _.headers.get(AuthService.csrfTokenHeaderId)));
  }

  logout() {
    return this.httpClient.post(api.LOGOUT, {});
  }
}
