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
import { FormPart, WorkflowFormPartsModel } from '../../../../models/workflowFormParts.model';
import { provideMockStore } from '@ngrx/store/testing';
import { Store } from '@ngrx/store';
import { WorkflowAddEmptyJob } from '../../../../stores/workflows/workflows.actions';

describe('JobsComponent', () => {
  let fixture: ComponentFixture<JobsComponent>;
  let underTest: JobsComponent;

  const initialAppState = {
    workflows: {
      workflowFormParts: new WorkflowFormPartsModel(
        [],
        undefined,
        new FormPart('jobStaticPart', 'jobStaticPart', true, 'jobStaticPart'),
        undefined,
        undefined,
      ),
      workflowAction: {
        mode: 'mode',
        workflowData: {
          jobs: [
            {
              order: 0,
              job: [{ property: 'jobStaticPart', value: 'value' }],
            },
          ],
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
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.mode).toBe(initialAppState.workflows.workflowAction.mode);
      expect(underTest.hiddenJobs).toEqual([]);
      expect(underTest.staticJobPart).toEqual(initialAppState.workflows.workflowFormParts.staticJobPart);
      expect(underTest.jobData).toEqual(initialAppState.workflows.workflowAction.workflowData.jobs);
    });
  }));

  it('toggleJob() should push job into hiddenJobs when it is not included with false value', async(() => {
    const hiddenJobsInitial = underTest.hiddenJobs;
    expect(hiddenJobsInitial).toEqual([]);
    underTest.toggleJob(0);
    const hiddenJobsUpdated = underTest.hiddenJobs;
    expect(hiddenJobsUpdated).toEqual([{ order: 0, isHidden: false }]);
  }));

  it('toggleJob() should toggle a job', async(() => {
    expect(underTest.hiddenJobs).toEqual([]);
    underTest.toggleJob(0);
    expect(underTest.hiddenJobs).toEqual([{ order: 0, isHidden: false }]);
    underTest.toggleJob(0);
    expect(underTest.hiddenJobs).toEqual([{ order: 0, isHidden: true }]);
    underTest.toggleJob(0);
    expect(underTest.hiddenJobs).toEqual([{ order: 0, isHidden: false }]);
  }));

  it('isJobHidden() should return whether is job hidden', async(() => {
    underTest.hiddenJobs = [
      { order: 0, isHidden: false },
      { order: 1, isHidden: true },
    ];

    expect(underTest.isJobHidden(0)).toBeTrue();
    expect(underTest.isJobHidden(1)).toBeFalse();
  }));

  it('isJobHidden() should return false when job is not included', async(() => {
    expect(underTest.isJobHidden(9999)).toBeFalse();
  }));

  it('getJobName() should return job name', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.getJobName(0)).toBe('value');
    });
  }));

  it('getJobName() should return empty string when job is not found', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.getJobName(9999)).toBe('');
    });
  }));

  it('addJob() add job actions should be dispatch', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const mockStore = fixture.debugElement.injector.get(Store);
      const storeSpy = spyOn(mockStore, 'dispatch');

      underTest.addJob();

      expect(storeSpy).toHaveBeenCalledTimes(1);
      expect(storeSpy).toHaveBeenCalledWith(new WorkflowAddEmptyJob(initialAppState.workflows.workflowAction.workflowData.jobs.length));
    });
  }));
});
