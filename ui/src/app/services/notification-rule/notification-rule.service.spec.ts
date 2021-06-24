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

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { api } from '../../constants/api.constants';
import { NotificationRuleService } from './notification-rule.service';
import { NotificationRuleModel, NotificationRuleModelFactory } from '../../models/notificationRule.model';
import { dagInstanceStatuses } from '../../models/enums/dagInstanceStatuses.constants';
import { TableSearchRequestModel } from '../../models/search/tableSearchRequest.model';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';

describe('NotificationRuleService', () => {
  let underTest: NotificationRuleService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationRuleService],
      imports: [HttpClientTestingModule],
    });
    underTest = TestBed.inject(NotificationRuleService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('createNotificationRule() should return created notificationRule', () => {
    const notificationRule = NotificationRuleFixture.create();

    underTest.createNotificationRule(notificationRule).subscribe(
      (data) => expect(data).toEqual(notificationRule),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.CREATE_NOTIFICATION_RULE);
    expect(req.request.method).toEqual('PUT');
    req.flush(notificationRule);
  });

  it('getNotificationRule() should return notificationRule data', () => {
    const notificationRule = NotificationRuleFixture.create();

    underTest.getNotificationRule(notificationRule.id).subscribe(
      (data) => expect(data).toEqual(notificationRule),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.GET_NOTIFICATION_RULE + `?id=${notificationRule.id}`);
    expect(req.request.method).toEqual('GET');
    req.flush(notificationRule);
  });

  it('updateNotificationRule() should return updated notificationRule', () => {
    const notificationRule = NotificationRuleFixture.create();

    underTest.updateNotificationRule(notificationRule).subscribe(
      (data) => expect(data).toEqual(notificationRule),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.UPDATE_NOTIFICATION_RULE);
    expect(req.request.method).toEqual('POST');
    req.flush(notificationRule);
  });

  it('deleteNotificationRule() should delete notificationRule', () => {
    const id = 1;
    const response = true;
    underTest.deleteNotificationRule(id).subscribe(
      (data) => expect(data).toEqual(response),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.DELETE_NOTIFICATION_RULE + `?id=${id}`);
    expect(req.request.method).toEqual('DELETE');
    req.flush(new Boolean(true));
  });

  it('searchNotificationRules() should search response with notification rules', () => {
    const request: TableSearchRequestModel = new TableSearchRequestModel(1, 10);
    const response: TableSearchResponseModel<NotificationRuleModel> = new TableSearchResponseModel<NotificationRuleModel>([], 1);

    underTest.searchNotificationRules(request).subscribe(
      (data) => expect(data).toEqual(response),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.SEARCH_NOTIFICATION_RULES);
    expect(req.request.method).toEqual('POST');
    req.flush(response);
  });
});

class NotificationRuleFixture {
  static create(): NotificationRuleModel {
    return NotificationRuleModelFactory.create(
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
  }
}
