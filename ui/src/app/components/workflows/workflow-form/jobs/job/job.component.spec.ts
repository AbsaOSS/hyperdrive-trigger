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
import { JobTemplateModelFactory } from '../../../../../models/jobTemplate.model';
import {
  HyperdriveTemplateParametersModel,
  ShellTemplateParametersModel,
  SparkTemplateParametersModel,
} from '../../../../../models/jobTemplateParameters.model';
import { jobTypes } from '../../../../../constants/jobTypes.constants';
import { JobDefinitionModelFactory } from '../../../../../models/jobDefinition.model';
import { ShellDefinitionParametersModel } from '../../../../../models/jobDefinitionParameters.model';

describe('JobComponent', () => {
  let fixture: ComponentFixture<JobComponent>;
  let underTest: JobComponent;

  const jobData = JobDefinitionModelFactory.createDefault(0);
  const sparkTemplate = JobTemplateModelFactory.create(1, 'template1', SparkTemplateParametersModel.createEmpty());
  const hyperdriveTemplate = JobTemplateModelFactory.create(2, 'template2', HyperdriveTemplateParametersModel.createEmpty());
  const shellTemplate = JobTemplateModelFactory.create(3, 'template3', ShellTemplateParametersModel.createEmpty());
  const jobTemplates = [sparkTemplate, hyperdriveTemplate, shellTemplate];
  const isShow = true;

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
    underTest.job = { ...jobData };
    underTest.jobTemplates = jobTemplates;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should emit updated job when nameChange() is called', () => {
    spyOn(underTest.jobChange, 'emit');
    const newNameValue = 'newNameValue';
    const updatedJob = { ...underTest.job, name: newNameValue };

    underTest.nameChange(newNameValue);

    expect(underTest.jobChange.emit).toHaveBeenCalled();
    expect(underTest.jobChange.emit).toHaveBeenCalledWith(updatedJob);
  });

  it('should emit updated job and job template change when jobTemplateChange() is called', () => {
    spyOn(underTest.jobChange, 'emit');
    spyOn(underTest.jobTemplateChanges, 'emit');
    const newTemplateId = 'newTemplateId';
    const updatedJob = { ...underTest.job, jobTemplateId: newTemplateId };

    underTest.jobTemplateChange(newTemplateId);

    expect(underTest.jobChange.emit).toHaveBeenCalled();
    expect(underTest.jobChange.emit).toHaveBeenCalledWith(updatedJob);
    expect(underTest.jobTemplateChanges.emit).toHaveBeenCalled();
    expect(underTest.jobTemplateChanges.emit).toHaveBeenCalledWith(newTemplateId);
  });

  it('should emit updated job when jobParametersChange() is called', () => {
    spyOn(underTest.jobChange, 'emit');

    const newJobParameters = ShellDefinitionParametersModel.createEmpty();
    const updatedJob = { ...underTest.job, jobParameters: newJobParameters };

    underTest.jobParametersChange(newJobParameters);

    expect(underTest.jobChange.emit).toHaveBeenCalled();
    expect(underTest.jobChange.emit).toHaveBeenCalledWith(updatedJob);
  });

  it('should emit empty job when jobTypeChange() is called', () => {
    spyOn(underTest.jobChange, 'emit');
    const newJobType = jobTypes.SHELL;
    const newEmptyJob = ShellDefinitionParametersModel.createEmpty();
    const updatedJob = { ...underTest.job, jobParameters: newEmptyJob };

    underTest.jobTypeChange(newJobType);

    expect(underTest.jobChange.emit).toHaveBeenCalled();
    expect(underTest.jobChange.emit).toHaveBeenCalledWith(updatedJob);
  });

  it(
    'getJobTemplates() should return job templates',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const result = underTest.getJobTemplates();
        expect(result).toEqual(new Map([[hyperdriveTemplate.id.toString(), hyperdriveTemplate.name]]));
      });
    }),
  );

  describe('isJobTemplateSelected() should return boolean value if template is selected', () => {
    const parameters = [
      { output: true, input: '0' },
      { output: true, input: '10' },
      { output: false, input: undefined },
      { output: false, input: null },
    ];

    parameters.forEach((parameter) => {
      it('should pass for value ' + parameter.input, () => {
        underTest.job.jobTemplateId = parameter.input;
        const result = underTest.isJobTemplateSelected();
        expect(result).toBe(parameter.output);
      });
    });
  });
});
