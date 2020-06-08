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

import { utilReducer, State } from './util.reducers';
import { GetQuartzDetail, GetQuartzDetailSuccess, GetQuartzDetailFailure } from './util.actions';
import { QuartzExpressionDetailModel, QuartzExpressionDetailModelFactory } from '../../models/quartzExpressionDetail.model';

describe('UtilReducers', () => {
  const initialState = {
    loading: false,
    quartzExpressionDetail: [],
  } as State;

  it('should set loading to true on get quartz detail', () => {
    const expression = '*/10 * * ? * *';
    const quartzAction = new GetQuartzDetail(expression);

    const actual = utilReducer(initialState, quartzAction);

    expect(actual).toEqual({ ...initialState, loading: true, quartzExpressionDetail: [] });
  });

  it('should set loading to false on get quartz detail success', () => {
    const quartzExpressionDetail: QuartzExpressionDetailModel[] = [
      QuartzExpressionDetailModelFactory.create('*/10 * * ? * *', true, 'every ten seconds'),
    ];
    const quartzAction = new GetQuartzDetailSuccess(quartzExpressionDetail);

    const actual = utilReducer(initialState, quartzAction);

    expect(actual).toEqual({
      ...initialState,
      loading: false,
      quartzExpressionDetail: quartzExpressionDetail,
    });
  });

  it('should set initial state with loading to false on get quartz detail failure', () => {
    const quartzAction = new GetQuartzDetailFailure();

    const actual = utilReducer(initialState, quartzAction);

    expect(actual).toEqual({ ...initialState, loading: false, quartzExpressionDetail: [] });
  });
});
