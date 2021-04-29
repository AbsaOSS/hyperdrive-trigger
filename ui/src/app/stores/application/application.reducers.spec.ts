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

import { applicationReducer, State } from './application.reducers';
import { LoadAppInfo, LoadAppInfoFailure, LoadAppInfoSuccess } from './application.actions';
import { AppInfoModel, AppInfoModelFactory } from '../../models/appInfo.model';

describe('ApplicationReducers', () => {
  const initialState: State = {
    loading: true,
    appInfo: AppInfoModelFactory.create('Undefined', 'Undefined', 'Undefined'),
  } as State;

  it('should set loading to true on load app info', () => {
    const applicationAction = new LoadAppInfo();

    const actual = applicationReducer(initialState, applicationAction);

    expect(actual).toEqual({ ...initialState, loading: true });
  });

  it('should set loading to false and app info on load app info success', () => {
    const appInfo: AppInfoModel = AppInfoModelFactory.create('environment', 'version', 'localhost:8088');
    const applicationAction = new LoadAppInfoSuccess(appInfo);

    const actual = applicationReducer(initialState, applicationAction);

    expect(actual).toEqual({ ...initialState, loading: false, appInfo: appInfo });
  });

  it('should set loading to false on load app info failure', () => {
    const applicationAction = new LoadAppInfoFailure();

    const actual = applicationReducer(initialState, applicationAction);

    expect(actual).toEqual({ ...initialState, loading: false });
  });
});
