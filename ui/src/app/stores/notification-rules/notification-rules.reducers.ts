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

import * as NotificationRulesActions from './notification-rules.actions';
import { NotificationRuleModel } from '../../models/notificationRule.model';
import * as JobTemplatesActions from '../job-templates/job-templates.actions';

export interface State {
  notificationRules: NotificationRuleModel[];
  total: number;
  page: number;
  loading: boolean;
  notificationRuleAction: {
    id: number;
    loading: boolean;
    notificationRule: NotificationRuleModel;
  };
}

const initialState: State = {
  notificationRules: [],
  total: 0,
  page: 1,
  loading: false,
  notificationRuleAction: {
    id: undefined,
    loading: true,
    notificationRule: undefined,
  },
};

export function notificationRulesReducer(state: State = initialState, action: NotificationRulesActions.NotificationRulesActions) {
  switch (action.type) {
    case NotificationRulesActions.SEARCH_NOTIFICATION_RULES:
      return { ...state, loading: true };
    case NotificationRulesActions.SEARCH_NOTIFICATION_RULES_SUCCESS:
      return {
        ...state,
        loading: false,
        total: action.payload.notificationRulesSearchResponse.total,
        notificationRules: action.payload.notificationRulesSearchResponse.items,
      };
    case NotificationRulesActions.SEARCH_NOTIFICATION_RULES_FAILURE:
      return { ...initialState, loading: false };
    case NotificationRulesActions.GET_NOTIFICATION_RULE:
      return {
        ...state,
        notificationRuleAction: {
          ...initialState.notificationRuleAction,
          id: action.payload,
          loading: true,
        },
      };
    case NotificationRulesActions.GET_NOTIFICATION_RULE_FAILURE:
      return {
        ...state,
        notificationRuleAction: {
          ...initialState.notificationRuleAction,
          loading: false,
        },
      };
    case NotificationRulesActions.SET_NOTIFICATION_RULE:
      return {
        ...state,
        notificationRuleAction: {
          ...state.notificationRuleAction,
          loading: true,
          notificationRule: action.payload,
        },
      };
    default:
      return state;
  }
}
