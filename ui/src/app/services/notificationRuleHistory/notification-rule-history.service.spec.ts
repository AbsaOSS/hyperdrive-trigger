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

import { TestBed } from '@angular/core/testing';

import { NotificationRuleHistoryService } from './notification-rule-history.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { api } from '../../constants/api.constants';
import { HistoryModelFactory, HistoryPairModel } from '../../models/historyModel';
import { NotificationRuleService } from '../notification-rule/notification-rule.service';
import { NotificationRuleHistoryModel, NotificationRuleHistoryModelFactory } from '../../models/notificationRuleHistoryModel';
import { NotificationRuleModelFactory } from '../../models/notificationRule.model';
import { dagInstanceStatuses } from '../../models/enums/dagInstanceStatuses.constants';

describe('NotificationRuleHistoryService', () => {
  let underTest: NotificationRuleHistoryService;
  let httpTestingController: HttpTestingController;
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationRuleService],
      imports: [HttpClientTestingModule],
    });
    underTest = TestBed.inject(NotificationRuleHistoryService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('getHistoryForNotificationRule() should return history for notificationRule', () => {
    const notificationRuleId = 1;
    const history = HistoryModelFactory.create(2, new Date(Date.now()), 'userName', { name: 'Create' });

    underTest.getHistoryForNotificationRule(notificationRuleId).subscribe(
      (data) => expect(data).toEqual([history]),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.GET_HISTORY_FOR_NOTIFICATION_RULE + `?notificationRuleId=${notificationRuleId}`);
    expect(req.request.method).toEqual('GET');
    req.flush([history]);
  });

  it('getNotificationRulesFromHistory() should return notificationRules from history', () => {
    const leftHistoryId = 11;
    const rightHistoryId = 12;

    const history = HistoryModelFactory.create(2, new Date(Date.now()), 'userName', { name: 'Create' });

    const notificationRuleHistoriesForComparison: HistoryPairModel<NotificationRuleHistoryModel> = {
      leftHistory: NotificationRuleHistoryModelFactory.create(history, leftHistoryId, dummyNotificationRule),
      rightHistory: NotificationRuleHistoryModelFactory.create(history, rightHistoryId, dummyNotificationRule),
    };

    underTest.getNotificationRulesFromHistory(leftHistoryId, rightHistoryId).subscribe(
      (data) => expect(data).toEqual(notificationRuleHistoriesForComparison),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(
      api.GET_NOTIFICATION_RULES_FROM_HISTORY + `?leftHistoryId=${leftHistoryId}&rightHistoryId=${rightHistoryId}`,
    );
    expect(req.request.method).toEqual('GET');
    req.flush(notificationRuleHistoriesForComparison);
  });
});
