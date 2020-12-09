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
import { JobTemplateShowComponent } from './job-template-show.component';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { JobTemplateModelFactory } from '../../../../models/jobTemplate.model';
import { JobParametersModelFactory } from '../../../../models/jobParameters.model';

describe('JobTemplateShow', () => {
  let underTest: JobTemplateShowComponent;
  let fixture: ComponentFixture<JobTemplateShowComponent>;

  const initialAppState = {
    jobTemplates: {
      jobTemplateAction: {
        id: 10,
        loading: false,
        isSuccessfullyLoaded: true,
        jobTemplate: JobTemplateModelFactory.create(
          0,
          'templateName',
          'fromConfig',
          { name: 'jobType' },
          JobParametersModelFactory.createEmpty(),
        ),
        jobTemplateFormEntries: [],
      },
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState: initialAppState })],
      declarations: [JobTemplateShowComponent],
      imports: [RouterTestingModule.withRoutes([]), FormsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobTemplateShowComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should set properties during on init', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.loading).toBe(initialAppState.jobTemplates.jobTemplateAction.loading);
      expect(underTest.jobTemplate).toBe(initialAppState.jobTemplates.jobTemplateAction.jobTemplate);
      expect(underTest.jobTemplateFormEntries).toBe(initialAppState.jobTemplates.jobTemplateAction.jobTemplateFormEntries);
      expect(underTest.isSuccessfullyLoaded).toBe(initialAppState.jobTemplates.jobTemplateAction.isSuccessfullyLoaded);
    });
  }));

  it('toggleJobTemplateInfoAccordion() should toggle job template info accordion', () => {
    expect(underTest.isJobTemplateInfoHidden).toBeFalse();
    underTest.toggleJobTemplateInfoAccordion();
    expect(underTest.isJobTemplateInfoHidden).toBeTrue();
  });

  it('toggleJobTemplateAccordion() should toggle job template accordion', () => {
    expect(underTest.isJobTemplateHidden).toBeFalse();
    underTest.toggleJobTemplateAccordion();
    expect(underTest.isJobTemplateHidden).toBeTrue();
  });
});
