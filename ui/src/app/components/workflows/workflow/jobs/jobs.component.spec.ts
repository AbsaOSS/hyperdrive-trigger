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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsComponent } from './jobs.component';
import { FormPartFactory, PartValidationFactory, WorkflowFormPartsModelFactory } from '../../../../models/workflowFormParts.model';
import { provideMockStore } from '@ngrx/store/testing';
import { Store } from '@ngrx/store';
import { WorkflowAddEmptyJob, WorkflowRemoveJob } from '../../../../stores/workflows/workflows.actions';
import { JobEntryModelFactory } from '../../../../models/jobEntry.model';
import { WorkflowEntryModelFactory } from '../../../../models/workflowEntry.model';
import { EventEmitter } from '@angular/core';

describe('JobsComponent', () => {
  let fixture: ComponentFixture<JobsComponent>;
  let underTest: JobsComponent;

  const uuid = '7a03f745-6b41-4161-9b57-765ac8f58574';
  const initialAppState = {
    workflows: {
      workflowFormParts: WorkflowFormPartsModelFactory.create(
        [],
        undefined,
        FormPartFactory.create('jobStaticPart', 'jobStaticPart', 'jobStaticPart', PartValidationFactory.create(true)),
        undefined,
        undefined,
      ),
      workflowAction: {
        mode: 'mode',
        workflowData: {
          jobs: [JobEntryModelFactory.create(uuid, 0, [WorkflowEntryModelFactory.create('jobStaticPart', 'value')])],
        },
      },
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState: initialAppState })],
      declarations: [JobsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should after view init set component properties', async(() => {
    underTest.jobsUnfold = new EventEmitter();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.mode).toBe(initialAppState.workflows.workflowAction.mode);
      expect(underTest.hiddenJobs.size).toEqual(0);
      expect(underTest.staticJobPart).toEqual(initialAppState.workflows.workflowFormParts.staticJobPart);
      expect(underTest.jobData).toEqual(initialAppState.workflows.workflowAction.workflowData.jobs);
    });
  }));

  it('toggleJob() should toggle a job', async(() => {
    expect(underTest.hiddenJobs.size).toEqual(0);
    underTest.toggleJob('abcd');
    expect(underTest.hiddenJobs.size).toEqual(1);
    expect(underTest.hiddenJobs).toContain('abcd');
    underTest.toggleJob('abcd');
    expect(underTest.hiddenJobs.size).toEqual(0);
  }));

  it('isJobHidden() should return whether is job hidden', async(() => {
    underTest.hiddenJobs = new Set<string>().add('abcd');

    expect(underTest.isJobHidden('abcd')).toBeTrue();
    expect(underTest.isJobHidden('9999')).toBeFalse();
  }));

  it('getJobName() should return job name', async(() => {
    underTest.jobsUnfold = new EventEmitter();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.getJobName(uuid)).toBe('value');
    });
  }));

  it('getJobName() should return empty string when job is not found', async(() => {
    underTest.jobsUnfold = new EventEmitter();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.getJobName('9999')).toBe('');
    });
  }));

  it('addJob() add job actions should be dispatched', async(() => {
    underTest.jobsUnfold = new EventEmitter();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const mockStore = fixture.debugElement.injector.get(Store);
      const storeSpy = spyOn(mockStore, 'dispatch');

      underTest.addJob();

      expect(storeSpy).toHaveBeenCalledTimes(1);
      expect(storeSpy).toHaveBeenCalledWith(new WorkflowAddEmptyJob(initialAppState.workflows.workflowAction.workflowData.jobs.length));
    });
  }));

  it('removeJob() remove job actions should be dispatched', async(() => {
    underTest.jobsUnfold = new EventEmitter();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const mockStore = fixture.debugElement.injector.get(Store);
      const storeSpy = spyOn(mockStore, 'dispatch');

      underTest.removeJob('abcdef');

      expect(storeSpy).toHaveBeenCalledTimes(1);
      expect(storeSpy).toHaveBeenCalledWith(new WorkflowRemoveJob('abcdef'));
    });
  }));
});
