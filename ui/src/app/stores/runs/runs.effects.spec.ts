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

import {TestBed} from '@angular/core/testing';
import {RunsEffects} from "./runs.effects";
import {DagRunService} from "../../services/dagRun/dag-run.service";
import {Observable} from "rxjs";
import {provideMockActions} from "@ngrx/effects/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {Actions} from "@ngrx/effects";
import {cold} from 'jasmine-marbles';
import {GetDagRuns} from "./runs.actions";
import * as RunsActions from "./runs.actions";

import {DagRunModel} from "../../models/dagRun.model";
import {DagRunFilterResultModel} from "../../models/dagRunSearchResponse.model";
import {SortModel} from "../../models/dagRunSearchRequest.model";

describe('RunsEffects', () => {
  let underTest: RunsEffects;
  let dagRunService: DagRunService;
  let mockActions: Observable<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RunsEffects,
        DagRunService,
        provideMockActions(() => mockActions),
      ],
      imports: [
        HttpClientTestingModule
      ]
    });
    underTest = TestBed.inject(RunsEffects);
    dagRunService = TestBed.inject(DagRunService);
    mockActions = TestBed.inject(Actions);
  });

  describe('runsGet', () => {
    it ('should return dag runs', () => {
      let dagRunModel = new DagRunModel(
        'workflowName', 'projectName', 2, 'Status', new Date(Date.now()), new Date(Date.now()), 0
      );
      const dagRunFilterResultModel = new DagRunFilterResultModel([dagRunModel], 1);

      const action = new GetDagRuns({from: 0, size: 0, sort: new SortModel('', 0)});
      mockActions = cold('-a', { a: action });
      const searchDagRunsResponse = cold('-a|', { a: dagRunFilterResultModel });
      const expected = cold('--a', { a: {
          type: RunsActions.GET_DAG_RUNS_SUCCESS,
          payload: { dagRuns: dagRunFilterResultModel }
        }});

      spyOn(dagRunService, 'searchDagRuns').and.returnValue(searchDagRunsResponse);

      expect(underTest.runsGet).toBeObservable(expected);
    });

    it ('should return get dag runs failure if dagRunService.searchDagRuns responds with an error', () => {
      const action = new GetDagRuns({from: 0, size: 0, sort: new SortModel('', 0)});
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|');
      spyOn(dagRunService, 'searchDagRuns').and.returnValue(errorResponse);

      const expected = cold('--a', { a: {
          type: RunsActions.GET_DAG_RUNS_FAILURE
        }});
      expect(underTest.runsGet).toBeObservable(expected);
    });
  });

});
