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
import * as RunsActions from './runs.actions';
import { GetDagRunDetail, GetDagRuns, KillJob } from './runs.actions';

import { DagRunModel, DagRunModelFactory } from '../../models/dagRuns/dagRun.model';
import {
  JobInstanceModel,
  JobInstanceModelFactory,
  JobInstanceParametersModelFactory,
  JobStatusFactory,
} from '../../models/jobInstance.model';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import { SortAttributesModel } from '../../models/search/sortAttributes.model';
import { JobTypeFactory } from '../../models/jobType.model';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { texts } from '../../constants/texts.constants';

describe('RunsEffects', () => {
  let underTest: RunsEffects;
  let dagRunService: DagRunService;
  let mockActions: Observable<any>;
  let toastrService: ToastrService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RunsEffects, DagRunService, provideMockActions(() => mockActions)],
      imports: [HttpClientTestingModule, ToastrModule.forRoot()],
    });
    underTest = TestBed.inject(RunsEffects);
    dagRunService = TestBed.inject(DagRunService);
    mockActions = TestBed.inject(Actions);
    toastrService = TestBed.inject(ToastrService);
  });

  describe('runsGet', () => {
    it('should return dag runs', () => {
      const dagRunModel = DagRunModelFactory.create(
        'workflowName',
        'projectName',
        2,
        'Status',
        'Triggered by',
        new Date(Date.now()),
        new Date(Date.now()),
        0,
      );
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
      const jobInstanceA: JobInstanceModel = JobInstanceModelFactory.create(
        id,
        'jobName0',
        JobInstanceParametersModelFactory.create(JobTypeFactory.create('JobType')),
        'applicationId',
        new Date(Date.now()),
        new Date(Date.now()),
        JobStatusFactory.create('Status'),
        1,
      );
      const jobInstanceB: JobInstanceModel = JobInstanceModelFactory.create(
        id,
        'jobName1',
        JobInstanceParametersModelFactory.create(JobTypeFactory.create('JobType1')),
        'applicationId',
        new Date(Date.now()),
        new Date(Date.now()),
        JobStatusFactory.create('Status'),
        2,
      );
      const jobInstanceC: JobInstanceModel = JobInstanceModelFactory.create(
        id,
        'jobName2',
        JobInstanceParametersModelFactory.create(JobTypeFactory.create('JobType2')),
        'applicationId',
        new Date(Date.now()),
        new Date(Date.now()),
        JobStatusFactory.create('Status'),
        3,
      );
      const action = new GetDagRunDetail(id);
      mockActions = cold('-a', { a: action });
      const dagRunDetailResponse = cold('-a|', { a: [jobInstanceC, jobInstanceB, jobInstanceA] });
      const expected = cold('--a', {
        a: {
          type: RunsActions.GET_DAG_RUN_DETAIL_SUCCESS,
          payload: [jobInstanceA, jobInstanceB, jobInstanceC],
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

  describe('jobKill', () => {
    it('should dispatch get dag run detail and show success toast', () => {
      const dagRunId = 1;
      const applicationId = 'applicationId-2';
      const killJobResponsePlain = true;

      const action = new KillJob({ dagRunId: dagRunId, applicationId: applicationId });
      mockActions = cold('-a', { a: action });
      const killJobResponse = cold('-a|', { a: killJobResponsePlain });
      const expected = cold('--a', {
        a: {
          type: RunsActions.GET_DAG_RUN_DETAIL,
          payload: dagRunId,
        },
      });

      spyOn(dagRunService, 'killJob').and.returnValue(killJobResponse);
      const toastrServiceSpy = spyOn(toastrService, 'success');

      expect(underTest.jobKill).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.KILL_JOB_SUCCESS_NOTIFICATION);
    });

    it('should dispatch get dag run detail and show error toast if dagRunService.killJob responds with false value', () => {
      const dagRunId = 1;
      const applicationId = 'applicationId-2';
      const killJobResponsePlain = false;

      const action = new KillJob({ dagRunId: dagRunId, applicationId: applicationId });
      mockActions = cold('-a', { a: action });
      const killJobResponse = cold('-a|', { a: killJobResponsePlain });
      const expected = cold('--a', {
        a: {
          type: RunsActions.GET_DAG_RUN_DETAIL,
          payload: dagRunId,
        },
      });

      spyOn(dagRunService, 'killJob').and.returnValue(killJobResponse);
      const toastrServiceSpy = spyOn(toastrService, 'error');

      expect(underTest.jobKill).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.KILL_JOB_FAILURE_NOTIFICATION);
    });

    it('should dispatch get dag run detail and show error toast if dagRunService.killJob responds with an error', () => {
      const dagRunId = 1;
      const applicationId = 'applicationId-2';
      const action = new KillJob({ dagRunId: dagRunId, applicationId: applicationId });
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|');

      spyOn(dagRunService, 'killJob').and.returnValue(errorResponse);
      const toastrServiceSpy = spyOn(toastrService, 'error');

      const expected = cold('--a', {
        a: {
          type: RunsActions.GET_DAG_RUN_DETAIL,
          payload: dagRunId,
        },
      });
      expect(underTest.jobKill).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.KILL_JOB_FAILURE_NOTIFICATION);
    });
  });
});
