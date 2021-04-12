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

import { JobComponent } from './job.component';
import {
  DynamicFormPart,
  DynamicFormPartFactory,
  DynamicFormPartsFactory,
  FormPart,
  FormPartFactory,
  PartValidationFactory,
  WorkflowFormPartsModelFactory,
} from '../../../../../models/workflowFormParts.model';
import { JobEntryModelFactory } from '../../../../../models/jobEntry.model';
import { WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import { Subject } from 'rxjs';
import { Action } from '@ngrx/store';
import { WorkflowJobChanged, WorkflowJobTypeSwitched } from '../../../../../stores/workflows/workflows.actions';

describe('JobComponent', () => {
  let fixture: ComponentFixture<JobComponent>;
  let underTest: JobComponent;

  const jobStaticPart: FormPart = FormPartFactory.create(
    'jobStaticPart',
    'jobStaticPart',
    'jobStaticPart',
    PartValidationFactory.create(true),
  );
  const jobSwitchPart: FormPart = FormPartFactory.create(
    'switchPartName',
    'switchPartProp',
    'switchPartType',
    PartValidationFactory.create(true),
    new Map([
      ['optionOne', 'optionOne'],
      ['optionTwo', 'optionTwoLabel'],
    ]),
  );
  const jobDynamicPartOne: DynamicFormPart = DynamicFormPartFactory.create('optionOne', [
    FormPartFactory.create('partOne', 'partOne', 'partOne', PartValidationFactory.create(true)),
  ]);
  const jobDynamicPartTwo: DynamicFormPart = DynamicFormPartFactory.createWithLabel('optionTwo', 'optionTwoLabel', [
    FormPartFactory.create('partTwo', 'partTwo', 'partTwo', PartValidationFactory.create(true)),
  ]);
  const workflowFormParts = WorkflowFormPartsModelFactory.create(
    [],
    undefined,
    jobStaticPart,
    jobSwitchPart,
    DynamicFormPartsFactory.create([], [jobDynamicPartOne, jobDynamicPartTwo]),
  );
  const jobsData = [
    JobEntryModelFactory.createWithUuid(0, [
      WorkflowEntryModelFactory.create('jobStaticPart', 'value'),
      WorkflowEntryModelFactory.create('switchPartProp', 'optionTwo'),
    ]),
  ];
  const mode = 'mode';
  const jobId: string = jobsData[0].jobId;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [JobComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(JobComponent);
    underTest = fixture.componentInstance;

    //set test data
    underTest.workflowFormParts = workflowFormParts;
    underTest.mode = mode;
    underTest.jobId = jobId;
    underTest.jobsData = jobsData;
    underTest.changes = new Subject<Action>();
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'should dispatch change action when jobChanges receives WorkflowEntryModel event',
    waitForAsync(() => {
      const property = 'property';
      const value = 'value';

      const changesSpy = spyOn(underTest.changes, 'next');
      fixture.detectChanges();
      underTest.jobChanges.next(WorkflowEntryModelFactory.create(property, value));
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(changesSpy).toHaveBeenCalled();
        expect(changesSpy).toHaveBeenCalledWith(
          new WorkflowJobChanged({ jobId: jobId, jobEntry: WorkflowEntryModelFactory.create(property, value) }),
        );
      });
    }),
  );

  it(
    'should dispatch change action when jobChanges receives switch part event',
    waitForAsync(() => {
      const property = workflowFormParts.jobSwitchPart.property;
      const value = 'value';

      const changesSpy = spyOn(underTest.changes, 'next');
      fixture.detectChanges();
      underTest.jobChanges.next(WorkflowEntryModelFactory.create(property, value));
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(changesSpy).toHaveBeenCalled();
        expect(changesSpy).toHaveBeenCalledWith(
          new WorkflowJobTypeSwitched({ jobId: jobId, jobEntry: WorkflowEntryModelFactory.create(property, value) }),
        );
      });
    }),
  );

  it(
    'getJobTypes() should return job types',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const result = underTest.getJobTypes();
        expect(result).toEqual(workflowFormParts.jobSwitchPart.options);
      });
    }),
  );

  it(
    'getSelectedJobComponent() should return first dynamic parts when no job is selected',
    waitForAsync(() => {
      underTest.jobId = undefined;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const resultLeft = underTest.getSelectedJobComponent();
        const resultRight = workflowFormParts.dynamicParts.jobDynamicParts[0].parts;

        expect(resultLeft).toEqual(resultRight);
      });
    }),
  );

  it(
    'getSelectedJobComponent() should return dynamic parts when sensor is selected',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const resultLeft = underTest.getSelectedJobComponent();
        const resultRight = workflowFormParts.dynamicParts.jobDynamicParts[1].parts;

        expect(resultLeft).toEqual(resultRight);
      });
    }),
  );

  it(
    'getJobData() should return return job data',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const result = underTest.getJobData();

        expect(result).toEqual(jobsData[0].entries);
      });
    }),
  );

  it(
    'getJobData() should return empty array when job data does not exist for job with defined id',
    waitForAsync(() => {
      underTest.jobId = '999';
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const result = underTest.getJobData();

        expect(result).toEqual([]);
      });
    }),
  );

  it(
    'getSelectedJob() should return selected job',
    waitForAsync(() => {
      underTest.jobId = jobId;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const resultLeft = underTest.getSelectedJob();
        const resultRight = jobsData[0].entries[1].value;
        expect(resultLeft).toEqual(resultRight);
      });
    }),
  );

  it(
    'getSelectedJob() should return undefined when job does not exist',
    waitForAsync(() => {
      underTest.jobId = '999';
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const result = underTest.getSelectedJob();

        expect(result).toBeUndefined();
      });
    }),
  );

  it(
    'getValue() should return value when property exists',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const queriedDetail = jobsData[0].entries[0];
        expect(underTest.getValue(queriedDetail.property)).toBe(queriedDetail.value);
      });
    }),
  );

  it(
    'getValue() should return undefined when property does not exist',
    waitForAsync(() => {
      const undefinedProperty = 'undefinedProperty';

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.getValue(undefinedProperty)).toBe(undefined);
      });
    }),
  );
});
