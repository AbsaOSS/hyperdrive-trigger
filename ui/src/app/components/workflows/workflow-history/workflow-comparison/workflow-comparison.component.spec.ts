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

import { WorkflowComparisonComponent } from './workflow-comparison.component';
import { DynamicFormPartsFactory, WorkflowFormPartsModelFactory } from '../../../../models/workflowFormParts.model';
import { workflowFormParts, workflowFormPartsSequences } from '../../../../constants/workflowFormParts.constants';
import { provideMockStore } from '@ngrx/store/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HistoryModelFactory } from '../../../../models/historyModel';

describe('WorkflowComparisonComponent', () => {
  let underTest: WorkflowComparisonComponent;
  let fixture: ComponentFixture<WorkflowComparisonComponent>;

  const initialAppState = {
    workflows: {
      history: {
        loading: true,
        workflowFormParts: WorkflowFormPartsModelFactory.create(
          workflowFormPartsSequences.allDetails,
          workflowFormParts.SENSOR.SENSOR_TYPE,
          workflowFormParts.JOB.JOB_NAME,
          workflowFormParts.JOB.JOB_TEMPLATE_ID,
          DynamicFormPartsFactory.create([], []),
        ),
        leftWorkflowHistoryData: {
          details: [{ property: 'detailProp', value: 'detailVal' }],
          sensor: [{ property: 'sensorProp', value: 'sensorVal' }],
          jobs: [{ jobId: 'jobId', order: 0, entries: [{ property: 'jobProp', value: 'jobVal' }] }],
        },
        rightWorkflowHistoryData: {
          details: [{ property: 'detailProp', value: 'detailVal' }],
          sensor: [{ property: 'sensorProp', value: 'sensorVal' }],
          jobs: [{ jobId: 'jobId', order: 0, entries: [{ property: 'jobProp', value: 'jobVal' }] }],
        },
        leftWorkflowHistory: HistoryModelFactory.create(1, new Date(Date.now()), 'User', { name: 'Create' }),
        rightWorkflowHistory: HistoryModelFactory.create(2, new Date(Date.now()), 'User', { name: 'Update' }),
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
                leftWorkflowHistoryId: '0',
                rightWorkflowHistoryId: '1',
              }),
            },
          },
        ],
        declarations: [WorkflowComparisonComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowComparisonComponent);
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
        expect(underTest.loading).toBe(initialAppState.workflows.history.loading);
        expect(underTest.workflowFormParts).toBe(initialAppState.workflows.history.workflowFormParts);
        expect(underTest.workflowDataLeft).toBe(initialAppState.workflows.history.leftWorkflowHistoryData);
        expect(underTest.workflowDataRight).toBe(initialAppState.workflows.history.rightWorkflowHistoryData);
        expect(underTest.workflowHistoryLeft).toBe(initialAppState.workflows.history.leftWorkflowHistory);
        expect(underTest.workflowHistoryRight).toBe(initialAppState.workflows.history.rightWorkflowHistory);
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
      underTest.workflowHistoryRight = undefined;
      fixture.whenStable().then(() => {
        expect(underTest.isLoadedSuccessfully()).toBeFalsy();
      });
    }),
  );
});
