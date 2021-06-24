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

import { SortAttributesModel } from '../../models/search/sortAttributes.model';
import {
  CreateNotificationRule,
  CreateNotificationRuleFailure,
  CreateNotificationRuleSuccess,
  DeleteNotificationRule,
  DeleteNotificationRuleFailure,
  DeleteNotificationRuleSuccess,
  GetNotificationRule,
  GetNotificationRuleFailure,
  GetNotificationRuleSuccess,
  NotificationRuleChanged,
  RemoveNotificationRuleBackendValidationError,
  SearchNotificationRules,
  SearchNotificationRulesFailure,
  SearchNotificationRulesSuccess,
  SetEmptyNotificationRule,
  UpdateNotificationRule,
  UpdateNotificationRuleFailure,
  UpdateNotificationRuleSuccess,
} from './notification-rules.actions';
import { State, notificationRulesReducer } from './notification-rules.reducers';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import { NotificationRuleModel, NotificationRuleModelFactory } from '../../models/notificationRule.model';
import { dagInstanceStatuses } from '../../models/enums/dagInstanceStatuses.constants';
import { WorkflowEntryModelFactory } from '../../models/workflowEntry.model';

describe('NotificationRulesReducers', () => {
  const initialState = {
    notificationRules: [],
    total: 0,
    page: 1,
    loading: false,
    notificationRuleAction: {
      id: undefined,
      mode: undefined,
      loading: true,
      initialNotificationRule: undefined,
      notificationRule: undefined,
      backendValidationErrors: undefined,
    },
    history: {
      loading: true,
      historyEntries: [],
      leftHistory: undefined,
      rightHistory: undefined,
    },
  } as State;

  it('should set loading to true on search notification rules', () => {
    const notificationRulesAction = new SearchNotificationRules({ from: 0, size: 0, sort: new SortAttributesModel('', 0) });

    const actual = notificationRulesReducer(initialState, notificationRulesAction);

    expect(actual).toEqual({ ...initialState, loading: true });
  });

  it('should set notification rules, total and loading to false on search notification rules success', () => {
    const notificationRule = NotificationRuleFixture.create();

    const notificationRuleSearchResult = new TableSearchResponseModel<NotificationRuleModel>([notificationRule], 1);
    const notificationRulesAction = new SearchNotificationRulesSuccess({ notificationRulesSearchResponse: notificationRuleSearchResult });

    const actual = notificationRulesReducer(initialState, notificationRulesAction);

    expect(actual).toEqual({
      ...initialState,
      loading: false,
      total: notificationRuleSearchResult.total,
      notificationRules: notificationRuleSearchResult.items,
    });
  });

  it('should set initial state with loading to false on search notification rules failure', () => {
    const notificationRulesAction = new SearchNotificationRulesFailure();

    const actual = notificationRulesReducer(initialState, notificationRulesAction);

    expect(actual).toEqual({ ...initialState, loading: false });
  });

  it('should set loading to true and notification rule id on get notification rule', () => {
    const id = 999;
    const notificationRulesAction = new GetNotificationRule(id);

    const actual = notificationRulesReducer(initialState, notificationRulesAction);

    expect(actual).toEqual({
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        id: id,
        loading: true,
      },
    });
  });

  it('should set loading to false and notification rule on get notification rule success', () => {
    const notificationRule = NotificationRuleFixture.create();

    const notificationRulesAction = new GetNotificationRuleSuccess(notificationRule);

    const actual = notificationRulesReducer(initialState, notificationRulesAction);

    expect(actual).toEqual({
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        initialNotificationRule: notificationRule,
        notificationRule: notificationRule,
        loading: false,
      },
    });
  });

  it('should set loading and successfully loaded to false on get notification rule failure', () => {
    const notificationRulesAction = new GetNotificationRuleFailure();

    const actual = notificationRulesReducer(initialState, notificationRulesAction);

    expect(actual).toEqual({
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        loading: false,
      },
    });
  });

  it('should set loading to true on create notification rule', () => {
    const notificationRulesAction = new CreateNotificationRule();

    const actual = notificationRulesReducer(initialState, notificationRulesAction);

    expect(actual).toEqual({
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        loading: true,
      },
    });
  });

  it('should set loading to false and notification rule on create notification rule success', () => {
    const notificationRule = NotificationRuleFixture.create();

    const notificationRulesAction = new CreateNotificationRuleSuccess(notificationRule);

    const actual = notificationRulesReducer(initialState, notificationRulesAction);

    expect(actual).toEqual({
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        notificationRule: notificationRule,
        loading: false,
      },
    });
  });

  it('should set loading to false and set validation errors on create notification rule failure', () => {
    const apiErrors = ['error1', 'error2'];
    const notificationRulesAction = new CreateNotificationRuleFailure(apiErrors);

    const actual = notificationRulesReducer(initialState, notificationRulesAction);

    expect(actual).toEqual({
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        backendValidationErrors: apiErrors,
        loading: false,
      },
    });
  });

  it('should set loading to true on update notification rule', () => {
    const notificationRulesAction = new UpdateNotificationRule();

    const actual = notificationRulesReducer(initialState, notificationRulesAction);

    expect(actual).toEqual({
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        loading: true,
      },
    });
  });

  it('should set loading to false and notification rule on update notification rule success', () => {
    const notificationRule = NotificationRuleFixture.create();

    const notificationRulesAction = new UpdateNotificationRuleSuccess(notificationRule);

    const actual = notificationRulesReducer(initialState, notificationRulesAction);

    expect(actual).toEqual({
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        notificationRule: notificationRule,
        loading: false,
      },
    });
  });

  it('should set loading to false and set validation errors on update notification rule failure', () => {
    const apiErrors = ['error1', 'error2'];
    const notificationRulesAction = new UpdateNotificationRuleFailure(apiErrors);

    const actual = notificationRulesReducer(initialState, notificationRulesAction);

    expect(actual).toEqual({
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        backendValidationErrors: apiErrors,
        loading: false,
      },
    });
  });

  it('should set loading to true on delete notification rule', () => {
    const id = 42;
    const notificationRulesAction = new DeleteNotificationRule(id);

    const actual = notificationRulesReducer(initialState, notificationRulesAction);

    expect(actual).toEqual({
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        id: id,
        loading: true,
      },
    });
  });

  it('should set loading to false and delete the notification rule on delete notification rule success', () => {
    const notificationRule = NotificationRuleFixture.create();
    const notificationRulesAction = new DeleteNotificationRuleSuccess(notificationRule.id);
    const previousState = {
      ...initialState,
      notificationRules: [notificationRule],
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        notificationRule: notificationRule,
      },
    };
    const actual = notificationRulesReducer(previousState, notificationRulesAction);

    expect(actual).toEqual({
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        id: notificationRule.id,
        loading: false,
      },
    });
  });

  it('should set loading to false on delete notification rule failure', () => {
    const notificationRulesAction = new DeleteNotificationRuleFailure();

    const actual = notificationRulesReducer(initialState, notificationRulesAction);

    expect(actual).toEqual({
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        loading: false,
      },
    });
  });

  it('should update the notification rule on notification rule changed', () => {
    const notificationRule = NotificationRuleFixture.create();
    const notificationRulesAction = new NotificationRuleChanged(WorkflowEntryModelFactory.create('workflowPrefix', 'some-value'));

    const previousState = {
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        notificationRule: notificationRule,
      },
    };
    const actual = notificationRulesReducer(previousState, notificationRulesAction);

    expect(actual).toEqual({
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        notificationRule: { ...notificationRule, workflowPrefix: 'some-value' },
      },
    });
  });

  it('should set the initial notification rule on set empty notification rule', () => {
    const notificationRule = NotificationRuleFixture.create();
    const emptyNotificationRule = NotificationRuleModelFactory.createEmpty();
    const notificationRulesAction = new SetEmptyNotificationRule();

    const previousState = {
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        notificationRule: notificationRule,
      },
    };
    const actual = notificationRulesReducer(previousState, notificationRulesAction);

    expect(actual).toEqual({
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        notificationRule: emptyNotificationRule,
        loading: false,
      },
    });
  });

  it('should remove the i-th backend validation error', () => {
    const notificationRulesAction = new RemoveNotificationRuleBackendValidationError(1);

    const previousState = {
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        backendValidationErrors: ['error0', 'error1', 'error2'],
      },
    };
    const actual = notificationRulesReducer(previousState, notificationRulesAction);

    expect(actual).toEqual({
      ...initialState,
      notificationRuleAction: {
        ...initialState.notificationRuleAction,
        backendValidationErrors: ['error0', 'error2'],
        loading: false,
      },
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
      [dagInstanceStatuses.SUCCEEDED.name, dagInstanceStatuses.FAILED.name],
      ['abc@xyz.com'],
      new Date(Date.now()),
      undefined,
      1,
    );
  }
}
