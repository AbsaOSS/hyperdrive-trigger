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

import * as RunsActions from "../runs/runs.actions";
import {DagRunModel} from "../../models/dagRun.model";
import {Filter, Sort} from "../../components/runs/runs.component";

export interface State {
  dagRuns: DagRunModel[]
  total: number
  page: number
  loading: boolean
  sort: Sort
  filters: Filter[]
}

const initialState: State = {
  dagRuns: [],
  total: 0,
  page: 1,
  loading: true,
  sort: null,
  filters: []
};

export function runsReducer(state: State = initialState, action: RunsActions.RunsActions) {
  switch (action.type) {
    case (RunsActions.GET_DAG_RUNS):
      return {...state, loading: true, sort: action.payload.sort, filters: action.payload.filters};
    case (RunsActions.GET_DAG_RUNS_SUCCESS):
      return {...state, loading: false, total: action.payload.dagRuns.total, dagRuns: action.payload.dagRuns.dagInstances};
    case (RunsActions.GET_DAG_RUNS_FAILURE):
      return initialState;
    default:
      return state;
  }
}
