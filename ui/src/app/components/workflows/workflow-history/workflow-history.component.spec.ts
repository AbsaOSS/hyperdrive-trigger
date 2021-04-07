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

import { WorkflowHistoryComponent } from './workflow-history.component';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { HistoryModelFactory } from '../../../models/historyModel';

describe('WorkflowHistoryComponent', () => {
  let underTest: WorkflowHistoryComponent;
  let fixture: ComponentFixture<WorkflowHistoryComponent>;

  const historyRecordOne = HistoryModelFactory.create(1, new Date(Date.now()), 'userName', { name: 'Create' });
  const historyRecordTwo = HistoryModelFactory.create(2, new Date(Date.now()), 'userName', { name: 'Update' });
  const historyRecordThree = HistoryModelFactory.create(3, new Date(Date.now()), 'userName', { name: 'Delete' });

  const initialAppState = {
    workflows: {
      history: {
        loading: true,
        workflowHistory: [historyRecordOne, historyRecordTwo],
      },
    },
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [provideMockStore({ initialState: initialAppState })],
        declarations: [WorkflowHistoryComponent],
        imports: [RouterTestingModule.withRoutes([]), FormsModule],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowHistoryComponent);
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
        expect(underTest.workflowHistory).toBe(initialAppState.workflows.history.workflowHistory);
      });
    }),
  );

  it(
    'isSelectable() should return false when 2 history records are selected',
    waitForAsync(() => {
      underTest.workflowHistory = [historyRecordOne, historyRecordTwo, historyRecordThree];
      underTest.selected = [historyRecordOne, historyRecordTwo];

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.isSelectable(historyRecordThree)).toBeFalsy();
      });
    }),
  );

  it(
    'isSelectable() should return true when 0 history records are selected',
    waitForAsync(() => {
      underTest.workflowHistory = [historyRecordOne, historyRecordTwo, historyRecordThree];
      underTest.selected = [];

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.isSelectable(historyRecordThree)).toBeTruthy();
      });
    }),
  );

  it(
    'isSelectable() should return true when 2 history records are selected and on input is already selected record',
    waitForAsync(() => {
      underTest.workflowHistory = [historyRecordOne, historyRecordTwo, historyRecordThree];
      underTest.selected = [historyRecordOne, historyRecordTwo];

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.isSelectable(historyRecordOne)).toBeTruthy();
      });
    }),
  );
});
