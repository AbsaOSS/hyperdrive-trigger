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

import { NotificationRuleModel, NotificationRuleModelFactory } from '../../models/notificationRule.model';
import * as NotificationRulesActions from '../notification-rules/notification-rules.actions';

export interface State {
  notificationRules: NotificationRuleModel[];
  total: number;
  page: number;
  loading: boolean;
  notificationRuleAction: {
    id: number;
    mode: string;
    loading: boolean;
    initialNotificationRule: NotificationRuleModel;
    notificationRule: NotificationRuleModel;
    backendValidationErrors: string[];
  };
}

const initialState: State = {
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
    case NotificationRulesActions.DELETE_NOTIFICATION_RULE:
      return {
        ...state,
        notificationRuleAction: {
          ...initialState.notificationRuleAction,
          id: action.payload,
          loading: true,
        },
      };
    case NotificationRulesActions.CREATE_NOTIFICATION_RULE:
    case NotificationRulesActions.UPDATE_NOTIFICATION_RULE:
      return {
        ...state,
        notificationRuleAction: {
          ...state.notificationRuleAction,
          loading: true,
        },
      };
    case NotificationRulesActions.GET_NOTIFICATION_RULE_SUCCESS:
      return {
        ...state,
        notificationRuleAction: {
          ...state.notificationRuleAction,
          loading: false,
          initialNotificationRule: action.payload,
          notificationRule: action.payload,
        },
      };
    case NotificationRulesActions.CREATE_NOTIFICATION_RULE_SUCCESS:
    case NotificationRulesActions.UPDATE_NOTIFICATION_RULE_SUCCESS:
      return {
        ...state,
        notificationRuleAction: {
          ...state.notificationRuleAction,
          loading: false,
          notificationRule: action.payload,
        },
      };
    case NotificationRulesActions.DELETE_NOTIFICATION_RULE_SUCCESS:
      return {
        ...state,
        notificationRules: state.notificationRules.filter((notificationRule) => notificationRule.id != action.payload),
        notificationRuleAction: {
          ...state.notificationRuleAction,
          notificationRule: undefined,
          loading: false,
          id: action.payload,
        },
      };
    case NotificationRulesActions.GET_NOTIFICATION_RULE_FAILURE:
    case NotificationRulesActions.DELETE_NOTIFICATION_RULE_FAILURE:
      return {
        ...state,
        notificationRuleAction: {
          ...initialState.notificationRuleAction,
          loading: false,
        },
      };
    case NotificationRulesActions.CREATE_NOTIFICATION_RULE_FAILURE:
    case NotificationRulesActions.UPDATE_NOTIFICATION_RULE_FAILURE:
      return {
        ...state,
        notificationRuleAction: {
          ...state.notificationRuleAction,
          backendValidationErrors: action.payload,
          loading: false,
        },
      };
    case NotificationRulesActions.NOTIFICATION_RULE_CHANGED:
      return {
        ...state,
        notificationRuleAction: {
          ...state.notificationRuleAction,
          notificationRule: { ...state.notificationRuleAction.notificationRule, [action.payload.property]: action.payload.value },
        },
      };
    case NotificationRulesActions.SET_EMPTY_NOTIFICATION_RULE:
      return {
        ...state,
        notificationRuleAction: {
          ...initialState.notificationRuleAction,
          notificationRule: NotificationRuleModelFactory.createEmpty(),
          loading: false,
        },
      };
    default:
      return state;
  }
}
