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
import { provideMockStore } from '@ngrx/store/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HistoryModelFactory, WorkflowHistoryModelFactory } from '../../../../models/historyModel';
import { WorkflowJoinedModelFactory } from '../../../../models/workflowJoined.model';

describe('WorkflowComparisonComponent', () => {
  let underTest: WorkflowComparisonComponent;
  let fixture: ComponentFixture<WorkflowComparisonComponent>;

  const initialAppState = {
    workflows: {
      history: {
        loading: true,
        workflowHistory: [],
        leftWorkflowHistory: WorkflowHistoryModelFactory.create(
          HistoryModelFactory.create(1, new Date(Date.now()), 'User', { name: 'Create' }),
          0,
          WorkflowJoinedModelFactory.createEmpty(),
        ),
        rightWorkflowHistory: WorkflowHistoryModelFactory.create(
          HistoryModelFactory.create(2, new Date(Date.now()), 'User', { name: 'Update' }),
          0,
          WorkflowJoinedModelFactory.createEmpty(),
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
