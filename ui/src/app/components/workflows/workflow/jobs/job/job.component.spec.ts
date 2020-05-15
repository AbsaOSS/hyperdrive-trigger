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

import { JobComponent } from './job.component';
import { provideMockStore } from '@ngrx/store/testing';
import { DynamicFormPart, DynamicFormParts, FormPart, WorkflowFormPartsModel } from '../../../../../models/workflowFormParts.model';
import { JobEntryModel } from '../../../../../models/jobEntry.model';
import { WorkflowEntryModel } from '../../../../../models/workflowEntry.model';

describe('JobComponent', () => {
  let fixture: ComponentFixture<JobComponent>;
  let underTest: JobComponent;

  const initialAppState = {
    workflows: {
      workflowFormParts: new WorkflowFormPartsModel(
        [],
        undefined,
        new FormPart('jobStaticPart', 'jobStaticPart', true, 'jobStaticPart'),
        new FormPart('switchPartName', 'switchPartProp', true, 'switchPartType', ['optionOne', 'optionTwo']),
        new DynamicFormParts(
          [],
          [
            new DynamicFormPart('optionOne', [new FormPart('partOne', 'partOne', true, 'partOne')]),
            new DynamicFormPart('optionTwo', [new FormPart('partTwo', 'partTwo', true, 'partTwo')]),
          ],
        ),
      ),
      workflowAction: {
        mode: 'mode',
        workflowData: {
          jobs: [JobEntryModel.createNew(0, [new WorkflowEntryModel('jobStaticPart', 'value')])],
        },
      },
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState: initialAppState })],
      declarations: [JobComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should after view init set component properties', async(() => {
    underTest.jobId = initialAppState.workflows.workflowAction.workflowData.jobs[0].jobId;
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.mode).toBe(initialAppState.workflows.workflowAction.mode);

      expect(underTest.jobDynamicParts).toEqual(initialAppState.workflows.workflowFormParts.dynamicParts.jobDynamicParts);
      expect(underTest.jobSwitchPart).toEqual(initialAppState.workflows.workflowFormParts.jobSwitchPart);
      expect(underTest.staticJobPart).toEqual(initialAppState.workflows.workflowFormParts.staticJobPart);
    });
  }));

  it('getJobTypes() should return job types', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const result = underTest.getJobTypes();
      expect(result).toEqual(initialAppState.workflows.workflowFormParts.jobSwitchPart.options);
    });
  }));

  it('getSelectedJobComponent() should return first dynamic parts when no job is selected', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const resultLeft = underTest.getSelectedJobComponent();
      const resultRight = initialAppState.workflows.workflowFormParts.dynamicParts.jobDynamicParts[0].parts;

      expect(resultLeft).toEqual(resultRight);
    });
  }));

  it('getSelectedJobComponent() should return dynamic parts when sensor is selected', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      underTest.selectedJob = initialAppState.workflows.workflowFormParts.dynamicParts.jobDynamicParts[1].name;
      const resultLeft = underTest.getSelectedJobComponent();
      const resultRight = initialAppState.workflows.workflowFormParts.dynamicParts.jobDynamicParts[1].parts;

      expect(resultLeft).toEqual(resultRight);
    });
  }));

  it('getValue() should return value when property exists', async(() => {
    underTest.jobId = initialAppState.workflows.workflowAction.workflowData.jobs[0].jobId;
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const queriedDetail = initialAppState.workflows.workflowAction.workflowData.jobs[0].job[0];
      expect(underTest.getValue(queriedDetail.property)).toBe(queriedDetail.value);
    });
  }));

  it('getValue() should return undefined when property does not exist', async(() => {
    underTest.jobId = initialAppState.workflows.workflowAction.workflowData.jobs[0].jobId;
    const undefinedProperty = 'undefinedProperty';

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.getValue(undefinedProperty)).toBe(undefined);
    });
  }));
});
