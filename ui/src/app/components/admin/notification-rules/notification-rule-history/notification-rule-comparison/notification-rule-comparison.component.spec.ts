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
import { NotificationRuleModelFactory } from '../../../../../models/notificationRule.model';
import { dagInstanceStatuses } from '../../../../../models/enums/dagInstanceStatuses.constants';
import { NotificationRuleHistoryModelFactory } from '../../../../../models/notificationRuleHistoryModel';
import { NotificationRuleComparisonComponent } from './notification-rule-comparison.component';
import { HistoryModelFactory } from '../../../../../models/historyModel';

describe('NotificationRuleComparisonComponent', () => {
  let underTest: NotificationRuleComparisonComponent;
  let fixture: ComponentFixture<NotificationRuleComparisonComponent>;

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

  const initialAppState = {
    notificationRules: {
      history: {
        loading: true,
        leftHistory: NotificationRuleHistoryModelFactory.create(
          HistoryModelFactory.create(0, new Date(Date.now()), 'userName', { name: 'operation' }),
          1,
          dummyNotificationRule,
        ),
        rightHistory: NotificationRuleHistoryModelFactory.create(
          HistoryModelFactory.create(1, new Date(Date.now()), 'userName', { name: 'operation' }),
          2,
          dummyNotificationRule,
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
                leftHistoryId: '0',
                rightHistoryId: '1',
              }),
            },
          },
        ],
        declarations: [NotificationRuleComparisonComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationRuleComparisonComponent);
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
        expect(underTest.loading).toBe(initialAppState.notificationRules.history.loading);
        expect(underTest.leftHistory).toBe(initialAppState.notificationRules.history.leftHistory);
        expect(underTest.rightHistory).toBe(initialAppState.notificationRules.history.rightHistory);
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
