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
import { JobDefinitionModelFactory } from '../../../../models/jobDefinition.model';
import { DagDefinitionJoinedModelFactory } from '../../../../models/dagDefinitionJoined.model';

describe('JobsComponent', () => {
  let fixture: ComponentFixture<JobsComponent>;
  let underTest: JobsComponent;

  const jobTemplates = [];
  const jobsData = DagDefinitionJoinedModelFactory.create(
    0,
    [JobDefinitionModelFactory.createDefault(0), JobDefinitionModelFactory.createDefault(1)],
    0,
  );

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
    underTest.isShow = false;
    underTest.jobs = jobsData;
    underTest.jobTemplates = jobTemplates;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'toggleJob() should toggle a job',
    waitForAsync(() => {
      expect(underTest.hiddenJobs.size).toEqual(0);
      underTest.toggleJob(0);
      expect(underTest.hiddenJobs.size).toEqual(1);
      expect(underTest.hiddenJobs).toContain(0);
      underTest.toggleJob(0);
      expect(underTest.hiddenJobs.size).toEqual(0);
    }),
  );

  it(
    'isJobHidden() should return whether is job hidden',
    waitForAsync(() => {
      underTest.hiddenJobs = new Set<number>().add(0);

      expect(underTest.isJobHidden(0)).toBeTrue();
      expect(underTest.isJobHidden(1234)).toBeFalse();
    }),
  );

  it('addJob() should add new empty job and emit updated jobs', () => {
    spyOn(underTest.jobsChange, 'emit');
    const newEmptyJob = JobDefinitionModelFactory.createDefault(underTest.jobs.jobDefinitions.length);
    const updatedJobs = { ...underTest.jobs, jobDefinitions: [...underTest.jobs.jobDefinitions, newEmptyJob] };

    underTest.addJob();

    expect(underTest.jobsChange.emit).toHaveBeenCalled();
    expect(underTest.jobsChange.emit).toHaveBeenCalledWith(updatedJobs);
  });

  it('removeJob() should remove job, update order and emit updated jobs', () => {
    spyOn(underTest.jobsChange, 'emit');
    const removedJobOrder = 1;

    underTest.removeJob(removedJobOrder);

    expect(underTest.jobsChange.emit).toHaveBeenCalled();
    expect(underTest.jobs.jobDefinitions.length).toBe(1);
    expect(underTest.jobs.jobDefinitions[0].order).toBe(0);
  });

  it('copyJob() should add copy of the job into jobs and emit updated jobs', () => {
    spyOn(underTest.jobsChange, 'emit');
    const copiedJobOrder = 1;

    underTest.copyJob(copiedJobOrder);

    expect(underTest.jobsChange.emit).toHaveBeenCalled();
    expect(underTest.jobs.jobDefinitions.length).toBe(3);
    expect(underTest.jobs.jobDefinitions[copiedJobOrder].jobParameters).toBe(
      underTest.jobs.jobDefinitions[underTest.jobs.jobDefinitions.length - 1].jobParameters,
    );
  });

  it('jobChange() should update job and emit updated jobs', () => {
    spyOn(underTest.jobsChange, 'emit');
    const updatedJobOrder = 1;
    const initialJob = underTest.jobs.jobDefinitions[updatedJobOrder];
    const updatedJob = { ...initialJob, name: 'newName' };
    const expectedResult = { ...underTest.jobs };
    expectedResult.jobDefinitions[updatedJobOrder] = updatedJob;

    underTest.jobChange(updatedJob);

    expect(underTest.jobsChange.emit).toHaveBeenCalled();
    expect(underTest.jobsChange.emit).toHaveBeenCalledWith(expectedResult);
  });

  it('reorderJobs() should reorder jobs and emit updated jobs', () => {
    spyOn(underTest.jobsChange, 'emit');
    const initialJobPosition = 0;
    const updatedJobPosition = 1;

    underTest.reorderJobs(initialJobPosition, updatedJobPosition);

    expect(underTest.jobsChange.emit).toHaveBeenCalled();
  });

  describe('switchJobs', () => {
    it('should switch and sort jobs', () => {
      const job0 = JobDefinitionModelFactory.createDefault(0);
      const job1 = JobDefinitionModelFactory.createDefault(1);
      const job2 = JobDefinitionModelFactory.createDefault(2);

      const jobs = [job0, job1, job2];
      const updatedJobs = [{ ...job2, order: 0 }, job1, { ...job0, order: 2 }];

      expect(underTest.switchJobs(jobs, 0, 2)).toEqual(updatedJobs);
      expect(underTest.switchJobs(jobs, 2, 0)).toEqual(updatedJobs);
    });

    it('should do nothing when positions are equal', () => {
      const job0 = JobDefinitionModelFactory.createDefault(0);
      const job1 = JobDefinitionModelFactory.createDefault(1);
      const job2 = JobDefinitionModelFactory.createDefault(2);

      const jobs = [job0, job1, job2];

      expect(underTest.switchJobs(jobs, 1, 1)).toEqual(jobs);
    });
  });
});
