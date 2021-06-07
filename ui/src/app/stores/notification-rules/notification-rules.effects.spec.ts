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
import { Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Actions } from '@ngrx/effects';
import { cold } from 'jasmine-marbles';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import { SortAttributesModel } from '../../models/search/sortAttributes.model';
import { NotificationRulesEffects } from './notification-rules.effects';
import { NotificationRuleService } from '../../services/notification-rule/notification-rule.service';
import { NotificationRuleModel, NotificationRuleModelFactory } from '../../models/notificationRule.model';
import * as NotificationRulesActions from './notification-rules.actions';
import { GetNotificationRule, SearchNotificationRules } from './notification-rules.actions';
import { createSpyFromClass, Spy } from 'jasmine-auto-spies';
import { WorkflowService } from '../../services/workflow/workflow.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { texts } from '../../constants/texts.constants';
import { absoluteRoutes } from '../../constants/routes.constants';
import { dagInstanceStatuses } from '../../models/enums/dagInstanceStatuses.constants';

describe('NotificationRulesEffects', () => {
  let underTest: NotificationRulesEffects;
  let notificationRuleService: Spy<NotificationRuleService>;
  let workflowService: Spy<WorkflowService>;
  let mockActions: Observable<any>;
  let toastrServiceSpy: Spy<ToastrService>;
  let routerSpy: Spy<Router>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationRulesEffects,
        { provide: NotificationRuleService, useValue: createSpyFromClass(NotificationRuleService) },
        { provide: WorkflowService, useValue: createSpyFromClass(WorkflowService) },
        { provide: ToastrService, useValue: createSpyFromClass(ToastrService) },
        { provide: Router, useValue: createSpyFromClass(Router) },
        provideMockActions(() => mockActions),
      ],
      imports: [HttpClientTestingModule],
    });

    underTest = TestBed.inject(NotificationRulesEffects);
    notificationRuleService = TestBed.inject<any>(NotificationRuleService);
    workflowService = TestBed.inject<any>(WorkflowService);
    mockActions = TestBed.inject(Actions);
    toastrServiceSpy = TestBed.inject<any>(ToastrService);
    routerSpy = TestBed.inject<any>(Router);
  });

  describe('notificationRulesSearch', () => {
    it('should return job templates', () => {
      const notificationRule = NotificationRuleFixture.create();

      const searchResponse = new TableSearchResponseModel<NotificationRuleModel>([notificationRule], 1);

      const action = new SearchNotificationRules({ from: 0, size: 0, sort: new SortAttributesModel('', 0) });
      mockActions = cold('-a', { a: action });
      const searchNotificationRulesResponse = cold('-a|', { a: searchResponse });
      const expected = cold('--a', {
        a: {
          type: NotificationRulesActions.SEARCH_NOTIFICATION_RULES_SUCCESS,
          payload: { notificationRulesSearchResponse: searchResponse },
        },
      });
      notificationRuleService.searchNotificationRules.and.returnValue(searchNotificationRulesResponse);

      expect(underTest.notificationRulesSearch).toBeObservable(expected);
    });

    it('should return search job templates failure if notificationRuleService.searchNotificationRules responds with an error', () => {
      const action = new SearchNotificationRules({ from: 0, size: 0, sort: new SortAttributesModel('', 0) });
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|');
      notificationRuleService.searchNotificationRules.and.returnValue(errorResponse);

      const expected = cold('--a', {
        a: {
          type: NotificationRulesActions.SEARCH_NOTIFICATION_RULES_FAILURE,
        },
      });
      expect(underTest.notificationRulesSearch).toBeObservable(expected);
    });
  });

  describe('notificationRuleGet', () => {
    it('should return notification rule', () => {
      const notificationRule = NotificationRuleFixture.create();
      const action = new GetNotificationRule(notificationRule.id);
      mockActions = cold('-a', { a: action });
      const getNotificationRuleResponse = cold('-a|', { a: notificationRule });
      const expected = cold('--a', {
        a: {
          type: NotificationRulesActions.GET_NOTIFICATION_RULE_SUCCESS,
          payload: notificationRule,
        },
      });
      notificationRuleService.getNotificationRule.and.returnValue(getNotificationRuleResponse);

      expect(underTest.notificationRuleGet).toBeObservable(expected);
    });

    it('should return get job template failure if notificationRuleService.getNotificationRule responds with an error', () => {
      const toastrServiceErrorSpy = toastrServiceSpy.error;
      const routerNavigateByUrlSpy = routerSpy.navigateByUrl;

      const action = new GetNotificationRule(10);
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|');
      notificationRuleService.getNotificationRule.and.returnValue(errorResponse);

      const expected = cold('--a', {
        a: {
          type: NotificationRulesActions.GET_NOTIFICATION_RULE_FAILURE,
        },
      });
      expect(underTest.notificationRuleGet).toBeObservable(expected);
      expect(toastrServiceErrorSpy).toHaveBeenCalledWith(texts.LOAD_NOTIFICATION_RULE_FAILURE_NOTIFICATION);
      expect(routerNavigateByUrlSpy).toHaveBeenCalledWith(absoluteRoutes.NOTIFICATION_RULES);
    });
  });
});

class NotificationRuleFixture {
  static create(): NotificationRuleModel {
    return NotificationRuleModelFactory.create(
      true,
      'Project 1',
      undefined,
      7200,
      [dagInstanceStatuses.SUCCEEDED, dagInstanceStatuses.FAILED],
      ['abc@xyz.com'],
      new Date(Date.now()),
      undefined,
      1,
    );
  }
}
