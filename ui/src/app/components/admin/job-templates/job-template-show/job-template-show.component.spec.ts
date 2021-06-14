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
import { JobTemplateShowComponent } from './job-template-show.component';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { JobTemplateModelFactory } from '../../../../models/jobTemplate.model';
import { ShellTemplateParametersModel, SparkTemplateParametersModel } from '../../../../models/jobTemplateParameters.model';
import { JobTypeFactory } from '../../../../models/jobType.model';

describe('JobTemplateShow', () => {
  let underTest: JobTemplateShowComponent;
  let fixture: ComponentFixture<JobTemplateShowComponent>;

  const initialAppState = {
    jobTemplates: {
      jobTemplateAction: {
        id: 10,
        loading: false,
        jobTemplate: JobTemplateModelFactory.create(
          0,
          'templateName',
          'fromConfig',
          { name: 'jobType' },
          SparkTemplateParametersModel.createEmpty(),
        ),
        jobTemplateFormEntries: [],
      },
    },
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [provideMockStore({ initialState: initialAppState })],
        declarations: [JobTemplateShowComponent],
        imports: [RouterTestingModule.withRoutes([]), FormsModule],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(JobTemplateShowComponent);
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
        expect(underTest.loading).toBe(initialAppState.jobTemplates.jobTemplateAction.loading);
        expect(underTest.jobTemplate).toBe(initialAppState.jobTemplates.jobTemplateAction.jobTemplate);
        expect(underTest.jobTemplateFormEntries).toBe(initialAppState.jobTemplates.jobTemplateAction.jobTemplateFormEntries);
      });
    }),
  );

  it('toggleJobTemplateInfoAccordion() should toggle job template info accordion', () => {
    expect(underTest.isJobTemplateInfoHidden).toBeFalse();
    underTest.toggleJobTemplateInfoAccordion();
    expect(underTest.isJobTemplateInfoHidden).toBeTrue();
  });

  it('toggleJobTemplateAccordion() should toggle job template accordion', () => {
    expect(underTest.isJobTemplateParametersHidden).toBeFalse();
    underTest.toggleJobTemplateParametersAccordion();
    expect(underTest.isJobTemplateParametersHidden).toBeTrue();
  });

  it('isJobTemplateEmpty() should return true if parameters are not set', () => {
    underTest.jobTemplate = JobTemplateModelFactory.create(
      0,
      'name',
      'formConfig',
      JobTypeFactory.create('Spark'),
      SparkTemplateParametersModel.createEmpty(),
    );
    expect(underTest.isJobTemplateEmpty()).toBeTrue();
    underTest.jobTemplate = JobTemplateModelFactory.create(
      0,
      'name',
      'formConfig',
      JobTypeFactory.create('Shell'),
      ShellTemplateParametersModel.createEmpty(),
    );
    expect(underTest.isJobTemplateEmpty()).toBeTrue();
  });

  it('isJobTemplateEmpty() should return false if parameters are set', () => {
    const sparkParams = SparkTemplateParametersModel.createEmpty();
    sparkParams.additionalFiles = new Set('fileName');
    underTest.jobTemplate = JobTemplateModelFactory.create(0, 'name', 'formConfig', JobTypeFactory.create('Spark'), sparkParams);
    expect(underTest.isJobTemplateEmpty()).toBeFalse();

    const shellParams = ShellTemplateParametersModel.createEmpty();
    shellParams.scriptLocation = 'script';
    underTest.jobTemplate = JobTemplateModelFactory.create(0, 'name', 'formConfig', JobTypeFactory.create('Shell'), shellParams);
    expect(underTest.isJobTemplateEmpty()).toBeFalse();
  });
});
