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
import { NotificationRuleHistoryComponent } from './notification-rule-history.component';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../stores/app.reducers';
import { provideMockStore } from '@ngrx/store/testing';
import { PreviousRouteService } from '../../../../services/previousRoute/previous-route.service';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkflowHistoryComponent } from '../../../workflows/workflow-history/workflow-history.component';
import { NotificationRuleModelFactory } from '../../../../models/notificationRule.model';
import { dagInstanceStatuses } from '../../../../models/enums/dagInstanceStatuses.constants';
import { HistoryModelFactory } from '../../../../models/historyModel';
import { NotificationRuleHistoryModelFactory } from '../../../../models/notificationRuleHistoryModel';

describe('NotificationRuleHistoryComponent', () => {
  let underTest: NotificationRuleHistoryComponent;
  let fixture: ComponentFixture<NotificationRuleHistoryComponent>;
  let store: Store<AppState>;
  let router: Router;
  let previousRouteService: PreviousRouteService;

  const dummyNotificationRule = NotificationRuleModelFactory.create(
    true,
    'Project 1',
    undefined,
    7200,
    [dagInstanceStatuses.SUCCEEDED.name, dagInstanceStatuses.FAILED.name],
    ['abc@xyz.com'],
    new Date(Date.now()),
    undefined,
    1,
  );

  const historyRecordOne = NotificationRuleHistoryModelFactory.create(
    HistoryModelFactory.create(1, new Date(Date.now()), 'userName', { name: 'Create' }),
    10,
    dummyNotificationRule,
  );
  const historyRecordTwo = NotificationRuleHistoryModelFactory.create(
    HistoryModelFactory.create(2, new Date(Date.now()), 'userName', { name: 'Update' }),
    11,
    dummyNotificationRule,
  );

  const initialAppState = {
    notificationRules: {
      history: {
        loading: true,
        historyEntries: [historyRecordOne, historyRecordTwo],
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
    fixture = TestBed.createComponent(NotificationRuleHistoryComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });
});
