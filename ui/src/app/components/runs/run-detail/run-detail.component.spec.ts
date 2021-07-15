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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RunDetailComponent } from './run-detail.component';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppState } from '../../../stores/app.reducers';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { GetDagRunDetail, KillJob } from '../../../stores/runs/runs.actions';
import { AppInfoModelFactory } from '../../../models/appInfo.model';
import { JobInstanceModelFactory, JobInstanceParametersModelFactory, JobStatusFactory } from '../../../models/jobInstance.model';
import { JobTypeFactory } from '../../../models/jobType.model';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog/confirmation-dialog.service';
import { texts } from '../../../constants/texts.constants';

describe('RunDetailComponent', () => {
  let underTest: RunDetailComponent;
  let fixture: ComponentFixture<RunDetailComponent>;
  let store: Store<AppState>;
  let toastrService: ToastrService;
  let confirmationDialogService: ConfirmationDialogService;

  const initialAppState = {
    application: {
      appInfo: AppInfoModelFactory.create('Undefined', 'Undefined', 'Undefined'),
    },
    runs: {
      detail: {
        loading: true,
        jobInstances: [],
      },
    },
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [ConfirmationDialogService, provideMockStore({ initialState: initialAppState })],
        declarations: [RunDetailComponent],
        imports: [HttpClientTestingModule, ToastrModule.forRoot()],
      }).compileComponents();
      store = TestBed.inject(Store);
      toastrService = TestBed.inject(ToastrService);
      confirmationDialogService = TestBed.inject(ConfirmationDialogService);
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(RunDetailComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'onInit should set component properties',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.loading).toBe(initialAppState.runs.detail.loading);
        expect(underTest.jobInstances).toBe(initialAppState.runs.detail.jobInstances);
      });
    }),
  );

  it(
    'onRefresh() should dispatch GetDagRunDetail',
    waitForAsync(() => {
      underTest.dagRunId = 42;
      underTest.refreshSubject = new Subject<boolean>();
      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      underTest.onRefresh();
      subject.next(true);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new GetDagRunDetail(underTest.dagRunId));
      });
    }),
  );

  it(
    'getApplicationId() should return a valid url ',
    waitForAsync(() => {
      const expectedUrl = 'http://localhost:8088/cluster/app/applicationId_1234';
      const url1 = underTest.getApplicationIdUrl('http://localhost:8088', 'applicationId_1234');
      expect(url1).toBe(expectedUrl);
      const url2 = underTest.getApplicationIdUrl('http://localhost:8088/', 'applicationId_1234');
      expect(url2).toBe(expectedUrl);
      const url3 = underTest.getApplicationIdUrl('http://localhost:8088', '/applicationId_1234');
      expect(url3).toBe(expectedUrl);
    }),
  );

  it(
    'getKillableJob() should return killable job if exists',
    waitForAsync(() => {
      const killableJobInstance = JobInstanceModelFactory.create(
        0,
        'jobName2',
        JobInstanceParametersModelFactory.create(JobTypeFactory.create('Spark')),
        'applicationId',
        new Date(Date.now()),
        new Date(Date.now()),
        JobStatusFactory.create('Running'),
        0,
      );
      const notKillableJobInstance = JobInstanceModelFactory.create(
        1,
        'jobName1',
        JobInstanceParametersModelFactory.create(JobTypeFactory.create('Spark')),
        undefined,
        new Date(Date.now()),
        new Date(Date.now()),
        JobStatusFactory.create('Status'),
        0,
      );

      underTest.jobInstances = [killableJobInstance, notKillableJobInstance];

      const result = underTest.getKillableJob();
      expect(result).toEqual(killableJobInstance);
    }),
  );

  it(
    'getKillableJob() should return undefined job if does not exist',
    waitForAsync(() => {
      const notKillableJobInstance = JobInstanceModelFactory.create(
        0,
        'jobName1',
        JobInstanceParametersModelFactory.create(JobTypeFactory.create('Spark')),
        undefined,
        new Date(Date.now()),
        new Date(Date.now()),
        JobStatusFactory.create('Status'),
        0,
      );

      underTest.jobInstances = [notKillableJobInstance];

      const result = underTest.getKillableJob();
      expect(result).toEqual(undefined);
    }),
  );

  it(
    'canKillJob() should return true if killable job exists',
    waitForAsync(() => {
      const killableJobInstance = JobInstanceModelFactory.create(
        0,
        'jobName2',
        JobInstanceParametersModelFactory.create(JobTypeFactory.create('Spark')),
        'applicationId',
        new Date(Date.now()),
        new Date(Date.now()),
        JobStatusFactory.create('Running'),
        0,
      );
      const notKillableJobInstance = JobInstanceModelFactory.create(
        0,
        'jobName1',
        JobInstanceParametersModelFactory.create(JobTypeFactory.create('Spark')),
        undefined,
        new Date(Date.now()),
        new Date(Date.now()),
        JobStatusFactory.create('Status'),
        0,
      );

      underTest.jobInstances = [killableJobInstance, notKillableJobInstance];

      const result = underTest.canKillJob();
      expect(result).toEqual(true);
    }),
  );

  it(
    'canKillJob() should return false if killable job does not exist',
    waitForAsync(() => {
      const notKillableJobInstance = JobInstanceModelFactory.create(
        0,
        'jobName1',
        JobInstanceParametersModelFactory.create(JobTypeFactory.create('Spark')),
        undefined,
        new Date(Date.now()),
        new Date(Date.now()),
        JobStatusFactory.create('Status'),
        0,
      );

      underTest.jobInstances = [notKillableJobInstance];

      const result = underTest.canKillJob();
      expect(result).toEqual(false);
    }),
  );

  it(
    'killJob() should dispatch kill job action with application id and dag run in when dialog is confirmed',
    waitForAsync(() => {
      const dagRunId = 1;
      const killableJobInstance = JobInstanceModelFactory.create(
        0,
        'jobName2',
        JobInstanceParametersModelFactory.create(JobTypeFactory.create('Spark')),
        'applicationId',
        new Date(Date.now()),
        new Date(Date.now()),
        JobStatusFactory.create('Running'),
        0,
      );
      const notKillableJobInstance = JobInstanceModelFactory.create(
        1,
        'jobName1',
        JobInstanceParametersModelFactory.create(JobTypeFactory.create('Spark')),
        undefined,
        new Date(Date.now()),
        new Date(Date.now()),
        JobStatusFactory.create('Status'),
        0,
      );
      underTest.jobInstances = [killableJobInstance, notKillableJobInstance];
      underTest.dagRunId = dagRunId;

      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

      underTest.killJob();
      subject.next(true);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new KillJob({ dagRunId: dagRunId, applicationId: killableJobInstance.applicationId }));
      });
    }),
  );

  it(
    'killJob() should not dispatch kill job action if killable job does not exist',
    waitForAsync(() => {
      const notKillableJobInstance = JobInstanceModelFactory.create(
        1,
        'jobName1',
        JobInstanceParametersModelFactory.create(JobTypeFactory.create('Spark')),
        undefined,
        new Date(Date.now()),
        new Date(Date.now()),
        JobStatusFactory.create('Status'),
        0,
      );
      underTest.jobInstances = [notKillableJobInstance];

      const toastrServiceSpy = spyOn(toastrService, 'error');

      underTest.killJob();

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
        expect(toastrServiceSpy).toHaveBeenCalledWith(texts.KILL_JOB_FAILURE_NOTIFICATION);
      });
    }),
  );
});
