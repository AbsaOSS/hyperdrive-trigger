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

import { UtilService } from './util.service';
import { api } from '../../constants/api.constants';
import { QuartzExpressionDetailModel, QuartzExpressionDetailModelFactory } from '../../models/quartzExpressionDetail.model';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

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

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('getQuartzDetail() should return quartz detail', () => {
    const quartz = '*/10 * * ? * *';
    const response: QuartzExpressionDetailModel = QuartzExpressionDetailModelFactory.create(quartz, true, 'description');
    underTest.getQuartzDetail(quartz).subscribe(
      (data) => expect(data).toEqual(response),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.GET_QUARTZ_DETAIL + `?expression=${encodeURI(quartz.toString())}`);
    expect(req.request.method).toEqual('GET');
    req.flush(response);
  });

  it('generateBulkErrorMessage() should return formatted error message', () => {
    const errorMessages = {
      workflow1: ['message11', 'message12'],
      workflow2: ['message21', 'message22'],
    };
    const expected =
      '<ul>' +
      '<li>workflow1<ul><li>message11</li><li>message12</li></ul></li>' +
      '<li>workflow2<ul><li>message21</li><li>message22</li></ul></li>' +
      '</ul>';

    const actual = underTest.generateBulkErrorMessage(errorMessages);

    expect(actual).toEqual(expected);
  });
});
