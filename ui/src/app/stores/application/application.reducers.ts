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

import * as ApplicationActions from '../application/application.actions';
import { AppInfoModel } from '../../models/appInfo.model';

export interface State {
  loading: boolean;
  appInfo: AppInfoModel;
}

const initialState: State = {
  loading: true,
  appInfo: {
    environment: 'Unknown',
    version: 'Unknown',
    resourceManagerUrl: 'Unknown',
  },
};

export function applicationReducer(state: State = initialState, action: ApplicationActions.ApplicationActions) {
  switch (action.type) {
    case ApplicationActions.LOAD_APP_INFO:
      return { ...state, loading: true };
    case ApplicationActions.LOAD_APP_INFO_SUCCESS:
      return {
        ...state,
        loading: false,
        appInfo: action.payload,
      };
    case ApplicationActions.LOAD_APP_INFO_FAILURE:
      return {
        ...state,
        loading: false,
        appInfo: state.appInfo,
      };
    default:
      return state;
  }
}
