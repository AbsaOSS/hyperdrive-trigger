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

import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { api } from '../../constants/api.constants';

describe('AuthService', () => {
  let underTest: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
      imports: [HttpClientTestingModule],
    });
    underTest = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('should return the user name', () => {
    const username = 'the-username';

    underTest.getUserInfo().subscribe(
      (data) => expect(data).toEqual(username),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.USER_INFO);
    expect(req.request.method).toEqual('GET');
    req.flush({ username: username });
  });

  it('should login', () => {
    const testToken = 'the-test-token';

    underTest.login('username', 'password').subscribe(
      (data) => expect(data).toEqual(testToken),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.LOGIN);
    expect(req.request.method).toEqual('POST');
    req.flush({}, { headers: { 'X-CSRF-TOKEN': testToken } });
  });

  it('should logout', () => {
    underTest.logout().subscribe(
      (data) => expect(data).toBeNull(),
      (error) => fail(error),
    );
    const req = httpTestingController.expectOne(api.LOGOUT);
    expect(req.request.method).toEqual('POST');
  });
});
