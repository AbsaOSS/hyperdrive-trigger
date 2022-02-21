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

import { provideMockStore } from '@ngrx/store/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HistoryModelFactory } from '../../../../../models/historyModel';
import { JobTemplateComparisonComponent } from './job-template-comparison.component';
import { JobTemplateModelFactory } from '../../../../../models/jobTemplate.model';
import { JobTemplateHistoryModelFactory } from '../../../../../models/jobTemplateHistoryModel';

describe('JobTemplateComparisonComponent', () => {
  let underTest: JobTemplateComparisonComponent;
  let fixture: ComponentFixture<JobTemplateComparisonComponent>;

  const dummyJobTemplate = JobTemplateModelFactory.createEmpty();

  const initialAppState = {
    jobTemplates: {
      history: {
        loading: true,
        leftHistory: JobTemplateHistoryModelFactory.create(
          HistoryModelFactory.create(0, new Date(Date.now()), 'userName', { name: 'operation' }),
          1,
          dummyJobTemplate,
        ),
        rightHistory: JobTemplateHistoryModelFactory.create(
          HistoryModelFactory.create(1, new Date(Date.now()), 'userName', { name: 'operation' }),
          2,
          dummyJobTemplate,
        ),
      },
    },
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [
          provideMockStore({ initialState: initialAppState }),
          {
            provide: ActivatedRoute,
            useValue: {
              params: of({
                historyIdLeft: '0',
                historyIdRight: '1',
              }),
            },
          },
        ],
        declarations: [JobTemplateComparisonComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(JobTemplateComparisonComponent);
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
        expect(underTest.loading).toBe(initialAppState.jobTemplates.history.loading);
        expect(underTest.leftHistory).toBe(initialAppState.jobTemplates.history.leftHistory);
        expect(underTest.rightHistory).toBe(initialAppState.jobTemplates.history.rightHistory);
      });
    }),
  );

  it(
    'isLoadedSuccessfully() should return true when is successfully loaded',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.isLoadedSuccessfully()).toBeTruthy();
      });
    }),
  );

  it(
    'isLoadedSuccessfully() should return false when at least one prop is undefined',
    waitForAsync(() => {
      fixture.detectChanges();
      underTest.rightHistory = undefined;
      fixture.whenStable().then(() => {
        expect(underTest.isLoadedSuccessfully()).toBeFalsy();
      });
    }),
  );
});
