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
  GetNotificationRule,
  GetNotificationRuleFailure,
  GetNotificationRuleSuccess,
  SearchNotificationRules,
  SearchNotificationRulesFailure,
  SearchNotificationRulesSuccess,
} from './notification-rules.actions';
import { State, notificationRulesReducer } from './notification-rules.reducers';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import { NotificationRuleModel, NotificationRuleModelFactory } from '../../models/notificationRule.model';
import { dagInstanceStatuses } from '../../models/enums/dagInstanceStatuses.constants';

describe('NotificationRulesReducers', () => {
  const initialState = {
    notificationRules: [],
    total: 0,
    page: 1,
    loading: false,
    notificationRuleAction: {
      id: undefined,
      loading: true,
      notificationRule: undefined,
    },
  } as State;

  it('should set loading to true on search job templates', () => {
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
