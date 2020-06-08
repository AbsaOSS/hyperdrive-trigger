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
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { QuartzExpressionDetailModel } from '../../models/quartzExpressionDetail.model';
import { api } from '../../constants/api.constants';
import { UtilService } from './util.service';

describe('UtilService', () => {
  let underTest: UtilService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UtilService],
      imports: [HttpClientTestingModule],
    });
    underTest = TestBed.inject(UtilService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('should return quartz expression details', () => {
    const expression = '*/10**?**';
    const quartzExpressionDetail: QuartzExpressionDetailModel[] = [];

    underTest.getQuartzDetail(expression).subscribe(
      (data) => expect(data).toEqual(quartzExpressionDetail),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.GET_QUARTZ_DETAIL + '?expression=' + expression);
    expect(req.request.method).toEqual('GET');
    req.flush([...quartzExpressionDetail]);
  });
});
