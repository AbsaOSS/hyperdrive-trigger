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
import * as ApplicationActions from './application.actions';
import { ApplicationEffects } from './application.effects';
import { provideMockStore } from '@ngrx/store/testing';
import { AppInfoService } from '../../services/appInfo/appInfo.service';
import { AppInfoModelFactory } from '../../models/appInfo.model';
import { LoadAppInfo } from './application.actions';

describe('ApplicationEffects', () => {
  let underTest: ApplicationEffects;
  let appInfoService: AppInfoService;
  let mockActions: Observable<any>;

  const initialAppState = {
    loading: true,
    appInfo: AppInfoModelFactory.create('Undefined', 'Undefined', 'Undefined'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApplicationEffects,
        AppInfoService,
        provideMockActions(() => mockActions),
        provideMockStore({ initialState: initialAppState }),
      ],
      imports: [HttpClientTestingModule],
    });
    underTest = TestBed.inject(ApplicationEffects);
    appInfoService = TestBed.inject(AppInfoService);
    mockActions = TestBed.inject(Actions);
  });

  describe('appInfoLoad', () => {
    it('should return app info when service returns success', () => {
      const response = AppInfoModelFactory.create('environment', 'version', 'localhost:8088');

      const action = new LoadAppInfo();
      mockActions = cold('-a', { a: action });

      const getAppInfoResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: ApplicationActions.LOAD_APP_INFO_SUCCESS,
          payload: response,
        },
      });

      spyOn(appInfoService, 'getAppInfo').and.returnValue(getAppInfoResponse);

      expect(underTest.appInfoLoad).toBeObservable(expected);
    });

    it('should return load app info failure when service throws exception while getting app info', () => {
      const action = new LoadAppInfo();
      mockActions = cold('-a', { a: action });

      const errorResponse = cold('-#|');
      spyOn(appInfoService, 'getAppInfo').and.returnValue(errorResponse);

      const expected = cold('--a', {
        a: {
          type: ApplicationActions.LOAD_APP_INFO_FAILURE,
        },
      });
      expect(underTest.appInfoLoad).toBeObservable(expected);
    });
  });
});
