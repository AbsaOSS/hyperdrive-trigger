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
import { JobEntryModelFactory } from '../../../../../models/jobEntry.model';
import { WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import { Subject } from 'rxjs';
import { Action } from '@ngrx/store';
import { WorkflowJobChanged, WorkflowJobTypeSwitched } from '../../../../../stores/workflows/workflows.actions';
import { JobTemplateModelFactory } from '../../../../../models/jobTemplate.model';
import { JobTypeFactory } from '../../../../../models/jobType.model';
import { SparkTemplateParametersModel } from '../../../../../models/jobTemplateParameters.model';
import { jobTemplateFormConfigs } from '../../../../../constants/jobTemplates.constants';
import { jobTypes } from '../../../../../constants/jobTypes.constants';

describe('JobComponent', () => {
  let fixture: ComponentFixture<JobComponent>;
  let underTest: JobComponent;

  const jobsData = [
    JobEntryModelFactory.createWithUuid(0, [
      WorkflowEntryModelFactory.create('jobStaticPart', 'value'),
      WorkflowEntryModelFactory.create('jobTemplateId', '2'),
    ]),
  ];
  const jobTemplates = [
    JobTemplateModelFactory.create(
      1,
      'template1',
      jobTemplateFormConfigs.SPARK,
      JobTypeFactory.create(jobTypes.SPARK),
      SparkTemplateParametersModel.createEmpty(),
    ),
    JobTemplateModelFactory.create(
      2,
      'template2',
      jobTemplateFormConfigs.SHELL,
      JobTypeFactory.create(jobTypes.SHELL),
      SparkTemplateParametersModel.createEmpty(),
    ),
    JobTemplateModelFactory.create(
      3,
      'template3',
      jobTemplateFormConfigs.HYPERDRIVE,
      JobTypeFactory.create(jobTypes.SPARK),
      SparkTemplateParametersModel.createEmpty(),
    ),
  ];
  const isShow = true;
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
    underTest.isShow = isShow;
    underTest.jobId = jobId;
    underTest.jobsData = jobsData;
    underTest.jobTemplates = jobTemplates;
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
      const property = underTest.JOB_TEMPLATE_PROPERTY;
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
    'getJobTemplates() should return job templates',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const result = underTest.getJobTemplates();
        expect(result).toEqual(new Map(jobTemplates.map((part) => [part.id.toString(), part.name])));
      });
    }),
  );

  it(
    'getSelectedFormConfig() should return default form config when no job is selected',
    waitForAsync(() => {
      underTest.jobId = undefined;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const resultLeft = underTest.getSelectedFormConfig();

        expect(resultLeft).toEqual(jobTemplateFormConfigs.SPARK);
      });
    }),
  );

  it(
    'getSelectedFormConfig() should return selected form config when job is selected',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const resultLeft = underTest.getSelectedFormConfig();
        const resultRight = jobTemplates.find(
          (jt) => jt.id.toString() === jobsData[0].entries.find((jd) => jd.property === underTest.JOB_TEMPLATE_PROPERTY).value.toString(),
        ).formConfig;

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
    'getSelectedJobTemplateId() should return selected job template id',
    waitForAsync(() => {
      underTest.jobId = jobId;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const resultLeft = underTest.getSelectedJobTemplateId();
        const resultRight = jobsData[0].entries[1].value;
        expect(resultLeft).toEqual(resultRight);
      });
    }),
  );

  it(
    'getSelectedJobTemplateId() should return undefined when template does not exist',
    waitForAsync(() => {
      underTest.jobId = '999';
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const result = underTest.getSelectedJobTemplateId();

        expect(result).toBeUndefined();
      });
    }),
  );
});
