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

import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {api} from '../app.api-paths';

describe('AuthService', () => {
  let underTest: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
      imports: [HttpClientTestingModule]
    });

    underTest = TestBed.get(AuthService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    const service: AuthService = TestBed.get(AuthService);
    expect(service).toBeTruthy();
  });

  it('should login', () => {
    // given
    const testToken = 'the-test-token';
    localStorage.removeItem('csrf-token');
    spyOn(localStorage, 'setItem');

    // when
    underTest.login('username', 'password')

    // then
      .subscribe(token => {
        expect(token).toEqual(token);
      });

    const req = httpTestingController.expectOne(api.LOGIN);
    expect(req.request.method).toEqual('POST');
    req.flush({}, { headers: { 'X-CSRF-TOKEN': testToken}});

    expect(localStorage.setItem).toHaveBeenCalledWith('csrf-token', testToken);
  });

  it('should logout', () => {
    // when
    underTest.logout().subscribe();

    // then
    const req = httpTestingController.expectOne(api.LOGOUT);
    expect(req.request.method).toEqual('POST');
    req.flush({});
  });

});
