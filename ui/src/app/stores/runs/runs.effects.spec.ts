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
import { RunsEffects } from './runs.effects';
import { DagRunService } from '../../services/dagRun/dag-run.service';
import { Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Actions } from '@ngrx/effects';
import { cold } from 'jasmine-marbles';
import { GetDagRunDetail, GetDagRuns } from './runs.actions';
import * as RunsActions from './runs.actions';

import { DagRunModel } from '../../models/dagRuns/dagRun.model';
import { JobInstanceModel, JobInstanceModelFactory, JobStatusFactory, JobTypeFactory } from '../../models/jobInstance.model';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import { SortAttributesModel } from '../../models/search/sortAttributes.model';

describe('RunsEffects', () => {
  let underTest: RunsEffects;
  let dagRunService: DagRunService;
  let mockActions: Observable<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RunsEffects, DagRunService, provideMockActions(() => mockActions)],
      imports: [HttpClientTestingModule],
    });
    underTest = TestBed.inject(RunsEffects);
    dagRunService = TestBed.inject(DagRunService);
    mockActions = TestBed.inject(Actions);
  });

  describe('runsGet', () => {
    it('should return dag runs', () => {
      const dagRunModel = new DagRunModel('workflowName', 'projectName', 2, 'Status', new Date(Date.now()), new Date(Date.now()), 0);
      const searchResponseModel = new TableSearchResponseModel<DagRunModel>([dagRunModel], 1);

      const action = new GetDagRuns({ from: 0, size: 0, sort: new SortAttributesModel('', 0) });
      mockActions = cold('-a', { a: action });
      const searchDagRunsResponse = cold('-a|', { a: searchResponseModel });
      const expected = cold('--a', {
        a: {
          type: RunsActions.GET_DAG_RUNS_SUCCESS,
          payload: { dagRuns: searchResponseModel },
        },
      });

      spyOn(dagRunService, 'searchDagRuns').and.returnValue(searchDagRunsResponse);

      expect(underTest.runsGet).toBeObservable(expected);
    });

    it('should return get dag runs failure if dagRunService.searchDagRuns responds with an error', () => {
      const action = new GetDagRuns({ from: 0, size: 0, sort: new SortAttributesModel('', 0) });
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|');
      spyOn(dagRunService, 'searchDagRuns').and.returnValue(errorResponse);

      const expected = cold('--a', {
        a: {
          type: RunsActions.GET_DAG_RUNS_FAILURE,
        },
      });
      expect(underTest.runsGet).toBeObservable(expected);
    });
  });

  describe('runDetailGet', () => {
    it('should return dag run detail', () => {
      const id = 0;
      const jobInstances: JobInstanceModel[] = [
        JobInstanceModelFactory.create(
          id,
          'jobName0',
          JobTypeFactory.create('JobType'),
          new Date(Date.now()),
          new Date(Date.now()),
          JobStatusFactory.create('Status'),
        ),
      ];

      const action = new GetDagRunDetail(id);
      mockActions = cold('-a', { a: action });
      const dagRunDetailResponse = cold('-a|', { a: jobInstances });
      const expected = cold('--a', {
        a: {
          type: RunsActions.GET_DAG_RUN_DETAIL_SUCCESS,
          payload: jobInstances,
        },
      });

      spyOn(dagRunService, 'getDagRunDetails').and.returnValue(dagRunDetailResponse);

      expect(underTest.runDetailGet).toBeObservable(expected);
    });

    it('should return get dag run detail failure if dagRunService.getDagRunDetails responds with an error', () => {
      const id = 0;
      const action = new GetDagRunDetail(id);
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|');
      spyOn(dagRunService, 'getDagRunDetails').and.returnValue(errorResponse);

      const expected = cold('--a', {
        a: {
          type: RunsActions.GET_DAG_RUN_DETAIL_FAILURE,
        },
      });
      expect(underTest.runDetailGet).toBeObservable(expected);
    });
  });
});
