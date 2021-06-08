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
import {
  CreateNotificationRule,
  DeleteNotificationRule,
  GetNotificationRule,
  SearchNotificationRules,
  UpdateNotificationRule,
} from './notification-rules.actions';
import { createSpyFromClass, Spy } from 'jasmine-auto-spies';
import { NotificationRuleService } from '../../services/notification-rule/notification-rule.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { texts } from '../../constants/texts.constants';
import { absoluteRoutes } from '../../constants/routes.constants';
import { dagInstanceStatuses } from '../../models/enums/dagInstanceStatuses.constants';
import * as NotificationRulesActions from '../notification-rules/notification-rules.actions';
import { ApiErrorModelFactory } from '../../models/errors/apiError.model';
import { NotificationRuleModel, NotificationRuleModelFactory } from '../../models/notificationRule.model';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

describe('NotificationRulesEffects', () => {
  let underTest: NotificationRulesEffects;
  let notificationRuleServiceSpy: Spy<NotificationRuleService>;
  let mockActions: Observable<any>;
  let mockStore: MockStore;
  let toastrServiceSpy: Spy<ToastrService>;
  let routerSpy: Spy<Router>;

  const dummyNotificationRule = NotificationRuleModelFactory.create(
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

  const initialAppState = {
    notificationRules: {
      notificationRuleAction: {
        id: 10,
        loading: false,
        notificationRule: dummyNotificationRule,
      },
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationRulesEffects,
        { provide: NotificationRuleService, useValue: createSpyFromClass(NotificationRuleService) },
        { provide: NotificationRuleService, useValue: createSpyFromClass(NotificationRuleService) },
        { provide: ToastrService, useValue: createSpyFromClass(ToastrService) },
        { provide: Router, useValue: createSpyFromClass(Router) },
        provideMockStore({ initialState: initialAppState }),
        provideMockActions(() => mockActions),
      ],
      imports: [HttpClientTestingModule],
    });

    underTest = TestBed.inject(NotificationRulesEffects);
    notificationRuleServiceSpy = TestBed.inject<any>(NotificationRuleService);
    mockActions = TestBed.inject(Actions);
    mockStore = TestBed.inject(MockStore);
    toastrServiceSpy = TestBed.inject<any>(ToastrService);
    routerSpy = TestBed.inject<any>(Router);
  });

  describe('notificationRulesSearch', () => {
    it('should return job templates', () => {
      const searchResponse = new TableSearchResponseModel<NotificationRuleModel>([dummyNotificationRule], 1);

      const action = new SearchNotificationRules({ from: 0, size: 0, sort: new SortAttributesModel('', 0) });
      mockActions = cold('-a', { a: action });
      const searchNotificationRulesResponse = cold('-a|', { a: searchResponse });
      const expected = cold('--a', {
        a: {
          type: NotificationRulesActions.SEARCH_NOTIFICATION_RULES_SUCCESS,
          payload: { notificationRulesSearchResponse: searchResponse },
        },
      });
      notificationRuleServiceSpy.searchNotificationRules.and.returnValue(searchNotificationRulesResponse);

      expect(underTest.notificationRulesSearch).toBeObservable(expected);
    });

    it('should return search job templates failure if notificationRuleService.searchNotificationRules responds with an error', () => {
      const action = new SearchNotificationRules({ from: 0, size: 0, sort: new SortAttributesModel('', 0) });
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|');
      notificationRuleServiceSpy.searchNotificationRules.and.returnValue(errorResponse);

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
      const notificationRule = dummyNotificationRule;
      const action = new GetNotificationRule(notificationRule.id);
      mockActions = cold('-a', { a: action });
      const getNotificationRuleResponse = cold('-a|', { a: notificationRule });
      const expected = cold('--a', {
        a: {
          type: NotificationRulesActions.GET_NOTIFICATION_RULE_SUCCESS,
          payload: notificationRule,
        },
      });
      notificationRuleServiceSpy.getNotificationRule.and.returnValue(getNotificationRuleResponse);

      expect(underTest.notificationRuleGet).toBeObservable(expected);
    });

    it('should return get job template failure if notificationRuleService.getNotificationRule responds with an error', () => {
      const toastrServiceErrorSpy = toastrServiceSpy.error;
      const routerNavigateByUrlSpy = routerSpy.navigateByUrl;

      const action = new GetNotificationRule(10);
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|');
      notificationRuleServiceSpy.getNotificationRule.and.returnValue(errorResponse);

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

  describe('notificationRuleCreate', () => {
    it('should return create notificationRule failure with no backend validation errors when service fails to create notificationRule', () => {
      const toastrServiceSpyError = toastrServiceSpy.error;

      const action = new CreateNotificationRule();
      mockActions = cold('-a', { a: action });
      const createNotificationRuleResponse = cold('-#|', null, 'notValidationError');

      const expected = cold('--a', {
        a: {
          type: NotificationRulesActions.CREATE_NOTIFICATION_RULE_FAILURE,
          payload: [],
        },
      });

      notificationRuleServiceSpy.createNotificationRule.and.returnValue(createNotificationRuleResponse);

      expect(underTest.notificationRuleCreate).toBeObservable(expected);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpyError).toHaveBeenCalledWith(texts.CREATE_NOTIFICATION_RULE_FAILURE_NOTIFICATION);
    });

    it('should return create notificationRule failure with backend validation errors when service fails to create notificationRule', () => {
      const toastrServiceSpyError = toastrServiceSpy.error;
      const error = ApiErrorModelFactory.create('error', { name: 'validationError' });

      const action = new CreateNotificationRule();
      mockActions = cold('-a', { a: action });
      const createNotificationRuleResponse = cold('-#|', null, [error]);

      const expected = cold('--a', {
        a: {
          type: NotificationRulesActions.CREATE_NOTIFICATION_RULE_FAILURE,
          payload: [error.message],
        },
      });

      notificationRuleServiceSpy.createNotificationRule.and.returnValue(createNotificationRuleResponse);

      expect(underTest.notificationRuleCreate).toBeObservable(expected);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(0);
    });

    it('should return create notificationRule success when service returns success creation', () => {
      const toastrServiceSpySuccess = toastrServiceSpy.success;
      const routerSpyNavigate = routerSpy.navigateByUrl;

      const notificationRule = dummyNotificationRule;
      const createNotificationRuleSuccessPayload: NotificationRuleModel = dummyNotificationRule;

      const action = new CreateNotificationRule();
      mockActions = cold('-a', { a: action });

      const createNotificationRuleResponse = cold('-a|', { a: notificationRule });

      const expected = cold('--a', {
        a: {
          type: NotificationRulesActions.CREATE_NOTIFICATION_RULE_SUCCESS,
          payload: createNotificationRuleSuccessPayload,
        },
      });

      notificationRuleServiceSpy.createNotificationRule.and.returnValue(createNotificationRuleResponse);

      expect(underTest.notificationRuleCreate).toBeObservable(expected);
      expect(toastrServiceSpySuccess).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpySuccess).toHaveBeenCalledWith(texts.CREATE_NOTIFICATION_RULE_SUCCESS_NOTIFICATION);
      expect(routerSpyNavigate).toHaveBeenCalledTimes(1);
      expect(routerSpyNavigate).toHaveBeenCalledWith(absoluteRoutes.SHOW_NOTIFICATION_RULE + '/' + notificationRule.id);
    });
  });

  describe('notificationRuleUpdate', () => {
    it('should return update notificationRule failure with no backend validation errors when service fails to update notificationRule', () => {
      const toastrServiceSpyError = toastrServiceSpy.error;

      const action = new UpdateNotificationRule();
      mockActions = cold('-a', { a: action });
      const updateNotificationRuleResponse = cold('-#|', null, 'notNotificationRuleValidation');

      const expected = cold('--a', {
        a: {
          type: NotificationRulesActions.UPDATE_NOTIFICATION_RULE_FAILURE,
          payload: [],
        },
      });

      notificationRuleServiceSpy.updateNotificationRule.and.returnValue(updateNotificationRuleResponse);

      expect(underTest.notificationRuleUpdate).toBeObservable(expected);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpyError).toHaveBeenCalledWith(texts.UPDATE_NOTIFICATION_RULE_FAILURE_NOTIFICATION);
    });

    it('should return update notificationRule failure with backend validation errors when service fails to update notificationRule', () => {
      const toastrServiceSpyError = toastrServiceSpy.error;
      const error = ApiErrorModelFactory.create('error', { name: 'validationError' });
      const action = new UpdateNotificationRule();
      mockActions = cold('-a', { a: action });
      const updateNotificationRuleResponse = cold('-#|', null, [error]);

      const expected = cold('--a', {
        a: {
          type: NotificationRulesActions.UPDATE_NOTIFICATION_RULE_FAILURE,
          payload: [error.message],
        },
      });

      notificationRuleServiceSpy.updateNotificationRule.and.returnValue(updateNotificationRuleResponse);

      expect(underTest.notificationRuleUpdate).toBeObservable(expected);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(0);
    });

    it('should return create notificationRule success when service returns success creation', () => {
      const toastrServiceSpySuccess = toastrServiceSpy.success;
      const routerSpyNavigate = routerSpy.navigateByUrl;

      const notificationRule = dummyNotificationRule;

      const action = new UpdateNotificationRule();
      mockActions = cold('-a', { a: action });

      const updateNotificationRuleResponse = cold('-a|', { a: notificationRule });

      const expected = cold('--a', {
        a: {
          type: NotificationRulesActions.UPDATE_NOTIFICATION_RULE_SUCCESS,
          payload: notificationRule,
        },
      });

      notificationRuleServiceSpy.updateNotificationRule.and.returnValue(updateNotificationRuleResponse);

      expect(underTest.notificationRuleUpdate).toBeObservable(expected);
      expect(toastrServiceSpySuccess).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpySuccess).toHaveBeenCalledWith(texts.UPDATE_NOTIFICATION_RULE_SUCCESS_NOTIFICATION);
      expect(routerSpyNavigate).toHaveBeenCalledTimes(1);
      expect(routerSpyNavigate).toHaveBeenCalledWith(absoluteRoutes.SHOW_NOTIFICATION_RULE + '/' + notificationRule.id);
    });
  });

  describe('notificationRuleDelete', () => {
    it('should return delete notificationRule success when service returns success deletion', () => {
      const toastrServiceSpySuccess = toastrServiceSpy.success;
      const routerSpyNavigate = routerSpy.navigateByUrl;
      const payload = 10;
      const response = true;

      const action = new DeleteNotificationRule(payload);
      mockActions = cold('-a', { a: action });

      const deleteNotificationRuleResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: NotificationRulesActions.DELETE_NOTIFICATION_RULE_SUCCESS,
          payload: payload,
        },
      });

      notificationRuleServiceSpy.deleteNotificationRule.and.returnValue(deleteNotificationRuleResponse);

      expect(underTest.notificationRuleDelete).toBeObservable(expected);
      expect(toastrServiceSpySuccess).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpySuccess).toHaveBeenCalledWith(texts.DELETE_NOTIFICATION_RULE_SUCCESS_NOTIFICATION);
      expect(routerSpyNavigate).toHaveBeenCalledTimes(1);
      expect(routerSpyNavigate).toHaveBeenCalledWith(absoluteRoutes.NOTIFICATION_RULES_HOME);
    });

    it('should return delete notificationRule failure when service fails to delete notificationRule', () => {
      const toastrServiceSpyError = toastrServiceSpy.error;
      const payload = 10;
      const response = false;

      const action = new DeleteNotificationRule(payload);
      mockActions = cold('-a', { a: action });

      const deleteNotificationRuleResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: NotificationRulesActions.DELETE_NOTIFICATION_RULE_FAILURE,
        },
      });

      notificationRuleServiceSpy.deleteNotificationRule.and.returnValue(deleteNotificationRuleResponse);

      expect(underTest.notificationRuleDelete).toBeObservable(expected);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpyError).toHaveBeenCalledWith(texts.DELETE_NOTIFICATION_RULE_FAILURE_NOTIFICATION);
    });

    it('should return delete notificationRule failure when service throws exception while deleting notificationRule', () => {
      const toastrServiceSpyError = toastrServiceSpy.error;
      const payload = 10;
      const action = new DeleteNotificationRule(payload);
      mockActions = cold('-a', { a: action });

      const errorResponse = cold('-#|');
      notificationRuleServiceSpy.deleteNotificationRule.and.returnValue(errorResponse);
      const expected = cold('--a', {
        a: {
          type: NotificationRulesActions.DELETE_NOTIFICATION_RULE_FAILURE,
        },
      });
      expect(underTest.notificationRuleDelete).toBeObservable(expected);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpyError).toHaveBeenCalledWith(texts.DELETE_NOTIFICATION_RULE_FAILURE_NOTIFICATION);
    });
  });
});
