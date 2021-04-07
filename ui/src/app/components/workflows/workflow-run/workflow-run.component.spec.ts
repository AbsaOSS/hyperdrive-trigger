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

import { WorkflowRunComponent } from './workflow-run.component';
import { provideMockStore } from '@ngrx/store/testing';
import { Store } from '@ngrx/store';
import { AppState } from '../../../stores/app.reducers';
import { RunJobs, RunJobsCancel } from '../../../stores/workflows/workflows.actions';
import { JobForRunModelFactory } from '../../../models/jobForRun.model';

describe('WorkflowRunComponent', () => {
  let underTest: WorkflowRunComponent;
  let fixture: ComponentFixture<WorkflowRunComponent>;
  let store: Store<AppState>;

  const initialAppState = {
    workflows: {
      jobsForRun: {
        isOpen: true,
        workflowId: 10,
        jobs: [JobForRunModelFactory.create('two', 2, 2), JobForRunModelFactory.create('one', 1, 1)],
      },
    },
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [WorkflowRunComponent],
        providers: [provideMockStore({ initialState: initialAppState })],
      }).compileComponents();
      store = TestBed.inject(Store);
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowRunComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'should set properties during on init',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const sortedJobs = [...initialAppState.workflows.jobsForRun.jobs].sort((left, right) => left.order - right.order);
        expect(underTest.isOpen).toBe(initialAppState.workflows.jobsForRun.isOpen);
        expect(underTest.workflowId).toBe(initialAppState.workflows.jobsForRun.workflowId);
        expect(underTest.jobs).toEqual(sortedJobs);
        expect(underTest.selectedJobs).toEqual(sortedJobs.map((job) => job.id));
      });
    }),
  );

  it('changeSelection() should insert or remove selected job', () => {
    const selectedJobs = [];
    const firstJobId = 1;
    const secondJobId = 2;
    underTest.selectedJobs = selectedJobs;

    underTest.changeSelection(firstJobId);
    expect(underTest.selectedJobs).toEqual([firstJobId]);
    underTest.changeSelection(secondJobId);
    expect(underTest.selectedJobs).toEqual([firstJobId, secondJobId]);
    underTest.changeSelection(firstJobId);
    expect(underTest.selectedJobs).toEqual([secondJobId]);
    underTest.changeSelection(secondJobId);
    expect(underTest.selectedJobs).toEqual([]);
  });

  it('isSelected() should return true when job is selected', () => {
    const selectedJobs = [1, 2, 3];
    underTest.selectedJobs = selectedJobs;

    const result = underTest.isSelected(selectedJobs[1]);

    expect(result).toBeTruthy();
  });

  it('isSelected() should return false when job is not selected', () => {
    const selectedJobs = [1, 2, 3];
    const fakeJobId = 9999;
    underTest.selectedJobs = selectedJobs;

    const result = underTest.isSelected(fakeJobId);

    expect(result).toBeFalsy();
  });

  it('close() should do nothing when modal is closed', () => {
    underTest.isOpen = false;
    const storeSpy = spyOn(store, 'dispatch');

    underTest.close(true);

    expect(storeSpy).toHaveBeenCalledTimes(0);
  });

  it('close() should dispatch RunJobsCancel when modal is open and not submitted', () => {
    underTest.isOpen = true;
    const submitted = false;
    const storeSpy = spyOn(store, 'dispatch');

    underTest.close(submitted);

    expect(storeSpy).toHaveBeenCalledTimes(1);
    expect(storeSpy).toHaveBeenCalledWith(new RunJobsCancel());
  });

  it('close() should dispatch RunJobs when modal is open and submitted', () => {
    const workflowId = 1;
    const selectedJobs = [1, 2, 3];
    underTest.isOpen = true;
    underTest.workflowId = workflowId;
    underTest.selectedJobs = selectedJobs;
    const submitted = true;
    const storeSpy = spyOn(store, 'dispatch');

    underTest.close(submitted);

    expect(storeSpy).toHaveBeenCalledTimes(1);
    expect(storeSpy).toHaveBeenCalledWith(new RunJobs({ workflowId: workflowId, jobs: selectedJobs }));
  });
});
