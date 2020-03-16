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

import {runsReducer, State} from './runs.reducers';
import {GetDagRuns, GetDagRunsFailure, GetDagRunsSuccess} from "./runs.actions";
import {DagRunFilterResultModel} from "../../models/dagRunSearchResponse.model";
import {DagRunModel} from "../../models/dagRun.model";
import {SortModel} from "../../models/dagRunSearchRequest.model";

describe('RunsReducers', () => {

  const initialState = {
    dagRuns: [],
    total: 0,
    page: 1,
    loading: false
  } as State;

  it('should set loading to true on get dag runs', () => {
    const runsAction = new GetDagRuns(
      {from: 0, size: 0, sort: new SortModel('', 0)}
    );

    const actual = runsReducer(initialState, runsAction);

    expect(actual).toEqual({...initialState, loading: true});
  });

  it('should set dag runs, total and loading to false on get dag runs success', () => {
    let dagRunModel = new DagRunModel(
      'workflowName', 'projectName', 2, 'Status', new Date(Date.now()), new Date(Date.now()), 0
    );
    const dagRunFilterResultModel = new DagRunFilterResultModel([dagRunModel], 1);
    const runsAction = new GetDagRunsSuccess({dagRuns: dagRunFilterResultModel});

    const actual = runsReducer(initialState, runsAction);

    expect(actual).toEqual(
      {...initialState, loading: false, total: dagRunFilterResultModel.total, dagRuns: dagRunFilterResultModel.runs}
      );
  });

  it ('should set initial state with loading to false on get dag runs failure', () => {
    const runsAction = new GetDagRunsFailure();

    const actual = runsReducer(initialState, runsAction);

    expect(actual).toEqual({...initialState, loading: false});
  });

});
