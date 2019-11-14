/*
 * Copyright 2018-2019 ABSA Group Limited
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
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {api} from '../app.api-paths';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  static readonly csrfTokenLocalId: string = 'csrf-token';
  static readonly csrfTokenHeaderId: string = 'X-CSRF-TOKEN';

  constructor(private http: HttpClient) {

  }

  isLoggedIn() {
    return localStorage.getItem(AuthService.csrfTokenLocalId) != null;
  }

  login(username: string, password: string) {
    const body = new FormData();
    body.append('username', username);
    body.append('password', password);
    return this.http.post(api.LOGIN, body, {observe: 'response'})
      .pipe(map(response => {
        const token = response.headers.get(AuthService.csrfTokenHeaderId);
        localStorage.setItem(AuthService.csrfTokenLocalId, token);
        return token;
      }));
  }

  logout() {
    return this.http.post(api.LOGOUT, {})
      .pipe(map(response => {
        localStorage.removeItem(AuthService.csrfTokenLocalId);
      }));
  }}
