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

import { JobsComponent } from './jobs.component';
import { FormPartFactory, PartValidationFactory, WorkflowFormPartsModelFactory } from '../../../../models/workflowFormParts.model';
import { Action } from '@ngrx/store';
import {
  WorkflowAddEmptyJob,
  WorkflowCopyJob,
  WorkflowJobsReorder,
  WorkflowRemoveJob,
} from '../../../../stores/workflows/workflows.actions';
import { JobEntryModelFactory } from '../../../../models/jobEntry.model';
import { WorkflowEntryModelFactory } from '../../../../models/workflowEntry.model';
import { EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

describe('JobsComponent', () => {
  let fixture: ComponentFixture<JobsComponent>;
  let underTest: JobsComponent;

  const uuid = '7a03f745-6b41-4161-9b57-765ac8f58574';
  const jobsData = [JobEntryModelFactory.create(uuid, 0, [WorkflowEntryModelFactory.create('jobStaticPart', 'value')])];
  const workflowFormParts = WorkflowFormPartsModelFactory.create(
    [],
    undefined,
    FormPartFactory.create('jobStaticPart', 'jobStaticPart', 'jobStaticPart', PartValidationFactory.create(true)),
    undefined,
    undefined,
  );
  const changes: Subject<Action> = new Subject<Action>();

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [JobsComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsComponent);
    underTest = fixture.componentInstance;

    // set test data
    underTest.jobsData = jobsData;
    underTest.workflowFormParts = workflowFormParts;
    underTest.changes = changes;
    underTest.jobsUnfold = new EventEmitter();
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'when jobsUnfold event is received it should clear hidden jobs',
    waitForAsync(() => {
      const hiddenJobs = new Set<string>().add('abcd');
      underTest.hiddenJobs = hiddenJobs;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.hiddenJobs.size).toEqual(hiddenJobs.size);
        underTest.jobsUnfold.next();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(underTest.hiddenJobs.size).toEqual(0);
        });
      });
    }),
  );

  it(
    'toggleJob() should toggle a job',
    waitForAsync(() => {
      expect(underTest.hiddenJobs.size).toEqual(0);
      underTest.toggleJob('abcd');
      expect(underTest.hiddenJobs.size).toEqual(1);
      expect(underTest.hiddenJobs).toContain('abcd');
      underTest.toggleJob('abcd');
      expect(underTest.hiddenJobs.size).toEqual(0);
    }),
  );

  it(
    'isJobHidden() should return whether is job hidden',
    waitForAsync(() => {
      underTest.hiddenJobs = new Set<string>().add('abcd');

      expect(underTest.isJobHidden('abcd')).toBeTrue();
      expect(underTest.isJobHidden('9999')).toBeFalse();
    }),
  );

  it(
    'getJobName() should return job name',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.getJobName(uuid)).toBe('value');
      });
    }),
  );

  it(
    'getJobName() should return empty string when job is not found',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.getJobName('9999')).toBe('');
      });
    }),
  );

  it(
    'addJob() add job actions should be dispatched',
    waitForAsync(() => {
      const changesSpy = spyOn(underTest.changes, 'next');

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.addJob();

        expect(changesSpy).toHaveBeenCalledTimes(1);
        expect(changesSpy).toHaveBeenCalledWith(new WorkflowAddEmptyJob(jobsData.length));
      });
    }),
  );

  it(
    'removeJob() remove job actions should be dispatched',
    waitForAsync(() => {
      const changesSpy = spyOn(underTest.changes, 'next');

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.removeJob('abcdef');

        expect(changesSpy).toHaveBeenCalledTimes(1);
        expect(changesSpy).toHaveBeenCalledWith(new WorkflowRemoveJob('abcdef'));
      });
    }),
  );

  it(
    'copyJob() copy job action should be dispatched',
    waitForAsync(() => {
      const changesSpy = spyOn(underTest.changes, 'next');

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.copyJob('abcdef');

        expect(changesSpy).toHaveBeenCalledTimes(1);
        expect(changesSpy).toHaveBeenCalledWith(new WorkflowCopyJob('abcdef'));
      });
    }),
  );

  it(
    'reorderJobs() reorder jobs actions should be dispatched when positions are not equal',
    waitForAsync(() => {
      const initialJobPosition = 1;
      const updatedJobPosition = 5;
      const changesSpy = spyOn(underTest.changes, 'next');

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.reorderJobs(initialJobPosition, updatedJobPosition);

        expect(changesSpy).toHaveBeenCalledTimes(1);
        expect(changesSpy).toHaveBeenCalledWith(new WorkflowJobsReorder({ initialJobPosition, updatedJobPosition }));
      });
    }),
  );

  it(
    'reorderJobs() reorder jobs actions should not be dispatched when positions are equal',
    waitForAsync(() => {
      const initialJobPosition = 5;
      const updatedJobPosition = 5;
      const changesSpy = spyOn(underTest.changes, 'next');

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.reorderJobs(initialJobPosition, updatedJobPosition);

        expect(changesSpy).toHaveBeenCalledTimes(0);
      });
    }),
  );
});
