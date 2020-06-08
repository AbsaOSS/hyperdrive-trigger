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
import { Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Actions } from '@ngrx/effects';
import { cold } from 'jasmine-marbles';
import { UtilEffects } from './util.effects';
import { UtilService } from '../../services/util/util.service';
import * as RunsActions from './util.actions';
import { GetQuartzDetail } from './util.actions';

import { QuartzExpressionDetailModel, QuartzExpressionDetailModelFactory } from '../../models/quartzExpressionDetail.model';

describe('UtilEffects', () => {
  let underTest: UtilEffects;
  let utilService: UtilService;
  let mockActions: Observable<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UtilEffects, UtilService, provideMockActions(() => mockActions)],
      imports: [HttpClientTestingModule],
    });
    underTest = TestBed.inject(UtilEffects);
    utilService = TestBed.inject(UtilService);
    mockActions = TestBed.inject(Actions);
  });

  describe('quartzDetailGet', () => {
    it('should return quartz detail', () => {
      const expression = '*/10 * * ? * *';
      const quartzDetail: QuartzExpressionDetailModel[] = [
        QuartzExpressionDetailModelFactory.create(expression, false, 'every 10 seconds'),
      ];

      const action = new GetQuartzDetail(expression);
      mockActions = cold('-a', { a: action });
      const quartzDetailResponse = cold('-a|', { a: quartzDetail });
      const expected = cold('--a', {
        a: {
          type: RunsActions.GET_QUARTZ_DETAIL_SUCCESS,
          payload: quartzDetail,
        },
      });

      spyOn(utilService, 'getQuartzDetail').and.returnValue(quartzDetailResponse);

      expect(underTest.quartzDetailGet).toBeObservable(expected);
    });

    it('should return quartz detail failure if utilService.getQuartzDetail responds with an error', () => {
      const expression = '*/10 * * ? * *';
      const action = new GetQuartzDetail(expression);
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|');
      spyOn(utilService, 'getQuartzDetail').and.returnValue(errorResponse);

      const expected = cold('--a', {
        a: {
          type: RunsActions.GET_QUARTZ_DETAIL_FAILURE,
        },
      });
      expect(underTest.quartzDetailGet).toBeObservable(expected);
    });
  });
});
