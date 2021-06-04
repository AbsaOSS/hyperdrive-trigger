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

import { Action } from '@ngrx/store';
import { TableSearchRequestModel } from '../../models/search/tableSearchRequest.model';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import { NotificationRuleModel } from '../../models/notificationRule.model';

export const SEARCH_NOTIFICATION_RULES = 'SEARCH_NOTIFICATION_RULES';
export const SEARCH_NOTIFICATION_RULES_SUCCESS = 'SEARCH_NOTIFICATION_RULES_SUCCESS';
export const SEARCH_NOTIFICATION_RULES_FAILURE = 'SEARCH_NOTIFICATION_RULES_FAILURE';
export const GET_NOTIFICATION_RULE = 'GET_NOTIFICATION_RULE';
export const GET_NOTIFICATION_RULE_FAILURE = 'GET_NOTIFICATION_RULE_FAILURE';
export const SET_NOTIFICATION_RULE = 'SET_NOTIFICATION_RULE';

export class SearchNotificationRules implements Action {
  readonly type = SEARCH_NOTIFICATION_RULES;
  constructor(public payload: TableSearchRequestModel) {}
}

export class SearchNotificationRulesSuccess implements Action {
  readonly type = SEARCH_NOTIFICATION_RULES_SUCCESS;
  constructor(public payload: { notificationRulesSearchResponse: TableSearchResponseModel<NotificationRuleModel> }) {}
}

export class SearchNotificationRulesFailure implements Action {
  readonly type = SEARCH_NOTIFICATION_RULES_FAILURE;
}

export class GetNotificationRule implements Action {
  readonly type = GET_NOTIFICATION_RULE;
  constructor(public payload: number) {}
}

export class GetNotificationRuleFailure implements Action {
  readonly type = GET_NOTIFICATION_RULE_FAILURE;
}

export class SetNotificationRule implements Action {
  readonly type = SET_NOTIFICATION_RULE;
  constructor(public payload: NotificationRuleModel) {}
}

export type NotificationRulesActions =
  | SearchNotificationRules
  | SearchNotificationRulesSuccess
  | SearchNotificationRulesFailure
  | GetNotificationRule
  | GetNotificationRuleFailure
  | SetNotificationRule;
