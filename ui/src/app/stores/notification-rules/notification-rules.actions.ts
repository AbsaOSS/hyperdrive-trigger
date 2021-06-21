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
import { WorkflowEntryModel } from '../../models/workflowEntry.model';
import { HistoryModel } from '../../models/historyModel';
import { NotificationRuleHistoryModel } from '../../models/notificationRuleHistoryModel';

export const SEARCH_NOTIFICATION_RULES = 'SEARCH_NOTIFICATION_RULES';
export const SEARCH_NOTIFICATION_RULES_SUCCESS = 'SEARCH_NOTIFICATION_RULES_SUCCESS';
export const SEARCH_NOTIFICATION_RULES_FAILURE = 'SEARCH_NOTIFICATION_RULES_FAILURE';

export const GET_NOTIFICATION_RULE = 'GET_NOTIFICATION_RULE';
export const GET_NOTIFICATION_RULE_SUCCESS = 'GET_NOTIFICATION_RULE_SUCCESS';
export const GET_NOTIFICATION_RULE_FAILURE = 'GET_NOTIFICATION_RULE_FAILURE';

export const CREATE_NOTIFICATION_RULE = 'CREATE_NOTIFICATION_RULE';
export const CREATE_NOTIFICATION_RULE_SUCCESS = 'CREATE_NOTIFICATION_RULE_SUCCESS';
export const CREATE_NOTIFICATION_RULE_FAILURE = 'CREATE_NOTIFICATION_RULE_FAILURE';

export const UPDATE_NOTIFICATION_RULE = 'UPDATE_NOTIFICATION_RULE';
export const UPDATE_NOTIFICATION_RULE_SUCCESS = 'UPDATE_NOTIFICATION_RULE_SUCCESS';
export const UPDATE_NOTIFICATION_RULE_FAILURE = 'UPDATE_NOTIFICATION_RULE_FAILURE';

export const DELETE_NOTIFICATION_RULE = 'DELETE_NOTIFICATION_RULE';
export const DELETE_NOTIFICATION_RULE_SUCCESS = 'DELETE_NOTIFICATION_RULE_SUCCESS';
export const DELETE_NOTIFICATION_RULE_FAILURE = 'DELETE_NOTIFICATION_RULE_FAILURE';

export const NOTIFICATION_RULE_CHANGED = 'NOTIFICATION_RULE_CHANGED';
export const SET_EMPTY_NOTIFICATION_RULE = 'SET_EMPTY_NOTIFICATION_RULE';
export const REMOVE_NOTIFICATION_RULE_BACKEND_VALIDATION_ERROR = 'REMOVE_NOTIFICATION_RULE_BACKEND_VALIDATION_ERROR';

export const LOAD_HISTORY_FOR_NOTIFICATION_RULE = 'LOAD_HISTORY_FOR_NOTIFICATION_RULE';
export const LOAD_HISTORY_FOR_NOTIFICATION_RULE_SUCCESS = 'LOAD_HISTORY_FOR_NOTIFICATION_RULE_SUCCESS';
export const LOAD_HISTORY_FOR_NOTIFICATION_RULE_FAILURE = 'LOAD_HISTORY_FOR_NOTIFICATION_RULE_FAILURE';

export const LOAD_NOTIFICATION_RULES_FROM_HISTORY = 'LOAD_NOTIFICATION_RULES_FROM_HISTORY';
export const LOAD_NOTIFICATION_RULES_FROM_HISTORY_SUCCESS = 'LOAD_NOTIFICATION_RULES_FROM_HISTORY_SUCCESS';
export const LOAD_NOTIFICATION_RULES_FROM_HISTORY_FAILURE = 'LOAD_NOTIFICATION_RULES_FROM_HISTORY_FAILURE';

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

export class GetNotificationRuleSuccess implements Action {
  readonly type = GET_NOTIFICATION_RULE_SUCCESS;
  constructor(public payload: NotificationRuleModel) {}
}

export class GetNotificationRuleFailure implements Action {
  readonly type = GET_NOTIFICATION_RULE_FAILURE;
}

export class CreateNotificationRule implements Action {
  readonly type = CREATE_NOTIFICATION_RULE;
}

export class CreateNotificationRuleSuccess implements Action {
  readonly type = CREATE_NOTIFICATION_RULE_SUCCESS;
  constructor(public payload: NotificationRuleModel) {}
}

export class CreateNotificationRuleFailure implements Action {
  readonly type = CREATE_NOTIFICATION_RULE_FAILURE;
  constructor(public payload: string[]) {}
}

export class UpdateNotificationRule implements Action {
  readonly type = UPDATE_NOTIFICATION_RULE;
}

export class UpdateNotificationRuleSuccess implements Action {
  readonly type = UPDATE_NOTIFICATION_RULE_SUCCESS;
  constructor(public payload: NotificationRuleModel) {}
}

export class UpdateNotificationRuleFailure implements Action {
  readonly type = UPDATE_NOTIFICATION_RULE_FAILURE;
  constructor(public payload: string[]) {}
}

export class DeleteNotificationRule implements Action {
  readonly type = DELETE_NOTIFICATION_RULE;
  constructor(public payload: number) {}
}

export class DeleteNotificationRuleSuccess implements Action {
  readonly type = DELETE_NOTIFICATION_RULE_SUCCESS;
  constructor(public payload: number) {}
}

export class DeleteNotificationRuleFailure implements Action {
  readonly type = DELETE_NOTIFICATION_RULE_FAILURE;
}

export class NotificationRuleChanged implements Action {
  readonly type = NOTIFICATION_RULE_CHANGED;
  constructor(public payload: WorkflowEntryModel) {}
}

export class SetEmptyNotificationRule implements Action {
  readonly type = SET_EMPTY_NOTIFICATION_RULE;
}

export class RemoveNotificationRuleBackendValidationError implements Action {
  readonly type = REMOVE_NOTIFICATION_RULE_BACKEND_VALIDATION_ERROR;
  constructor(public payload: number) {}
}

export class LoadHistoryForNotificationRule implements Action {
  readonly type = LOAD_HISTORY_FOR_NOTIFICATION_RULE;
  constructor(public payload: number) {}
}

export class LoadHistoryForNotificationRuleSuccess implements Action {
  readonly type = LOAD_HISTORY_FOR_NOTIFICATION_RULE_SUCCESS;
  constructor(public payload: HistoryModel[]) {}
}

export class LoadHistoryForNotificationRuleFailure implements Action {
  readonly type = LOAD_HISTORY_FOR_NOTIFICATION_RULE_FAILURE;
}

export class LoadNotificationRulesFromHistory implements Action {
  readonly type = LOAD_NOTIFICATION_RULES_FROM_HISTORY;
  constructor(public payload: { leftHistoryId: number; rightHistoryId: number }) {}
}

export class LoadNotificationRulesFromHistorySuccess implements Action {
  readonly type = LOAD_NOTIFICATION_RULES_FROM_HISTORY_SUCCESS;
  constructor(
    public payload: {
      leftHistory: NotificationRuleHistoryModel;
      rightHistory: NotificationRuleHistoryModel;
    },
  ) {}
}

export class LoadNotificationRulesFromHistoryFailure implements Action {
  readonly type = LOAD_NOTIFICATION_RULES_FROM_HISTORY_FAILURE;
}

export type NotificationRulesActions =
  | SearchNotificationRules
  | SearchNotificationRulesSuccess
  | SearchNotificationRulesFailure
  | CreateNotificationRule
  | CreateNotificationRuleSuccess
  | CreateNotificationRuleFailure
  | GetNotificationRule
  | GetNotificationRuleSuccess
  | GetNotificationRuleFailure
  | UpdateNotificationRule
  | UpdateNotificationRuleSuccess
  | UpdateNotificationRuleFailure
  | DeleteNotificationRule
  | DeleteNotificationRuleSuccess
  | DeleteNotificationRuleFailure
  | NotificationRuleChanged
  | SetEmptyNotificationRule
  | RemoveNotificationRuleBackendValidationError
  | LoadHistoryForNotificationRule
  | LoadHistoryForNotificationRuleSuccess
  | LoadHistoryForNotificationRuleFailure
  | LoadNotificationRulesFromHistory
  | LoadNotificationRulesFromHistorySuccess
  | LoadNotificationRulesFromHistoryFailure;
