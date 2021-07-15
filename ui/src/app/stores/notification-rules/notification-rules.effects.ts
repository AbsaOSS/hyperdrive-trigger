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

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as NotificationRulesActions from './notification-rules.actions';
import { catchError, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import { NotificationRuleService } from '../../services/notification-rule/notification-rule.service';
import { NotificationRuleModel } from '../../models/notificationRule.model';

import { ToastrService } from 'ngx-toastr';
import { texts } from '../../constants/texts.constants';
import { absoluteRoutes } from '../../constants/routes.constants';
import { Router } from '@angular/router';
import { AppState, selectNotificationRulesState } from '../app.reducers';
import * as fromNotificationRules from './notification-rules.reducers';
import { Store } from '@ngrx/store';
import { ApiUtil } from '../../utils/api/api.util';
import { HistoryModel, HistoryPairModel } from '../../models/historyModel';
import { NotificationRuleHistoryService } from '../../services/notificationRuleHistory/notification-rule-history.service';
import { NotificationRuleHistoryModel } from '../../models/notificationRuleHistoryModel';

@Injectable()
export class NotificationRulesEffects {
  constructor(
    private actions: Actions,
    private notificationRuleService: NotificationRuleService,
    private notificationRuleHistoryService: NotificationRuleHistoryService,
    private toastrService: ToastrService,
    private router: Router,
    private store: Store<AppState>,
  ) {}

  @Effect({ dispatch: true })
  notificationRulesSearch = this.actions.pipe(
    ofType(NotificationRulesActions.SEARCH_NOTIFICATION_RULES),
    switchMap((action: NotificationRulesActions.SearchNotificationRules) => {
      return this.notificationRuleService.searchNotificationRules(action.payload).pipe(
        mergeMap((searchResult: TableSearchResponseModel<NotificationRuleModel>) => {
          return [
            {
              type: NotificationRulesActions.SEARCH_NOTIFICATION_RULES_SUCCESS,
              payload: { notificationRulesSearchResponse: searchResult },
            },
          ];
        }),
        catchError(() => {
          return [
            {
              type: NotificationRulesActions.SEARCH_NOTIFICATION_RULES_FAILURE,
            },
          ];
        }),
      );
    }),
  );

  @Effect({ dispatch: true })
  notificationRuleGet = this.actions.pipe(
    ofType(NotificationRulesActions.GET_NOTIFICATION_RULE),
    switchMap((action: NotificationRulesActions.GetNotificationRule) => {
      return this.notificationRuleService.getNotificationRule(action.payload).pipe(
        mergeMap((notificationRule: NotificationRuleModel) => {
          return [
            {
              type: NotificationRulesActions.GET_NOTIFICATION_RULE_SUCCESS,
              payload: notificationRule,
            },
          ];
        }),
        catchError(() => {
          this.toastrService.error(texts.LOAD_NOTIFICATION_RULE_FAILURE_NOTIFICATION);
          this.router.navigateByUrl(absoluteRoutes.NOTIFICATION_RULES);
          return [
            {
              type: NotificationRulesActions.GET_NOTIFICATION_RULE_FAILURE,
            },
          ];
        }),
      );
    }),
  );

  @Effect({ dispatch: true })
  notificationRuleCreate = this.actions.pipe(
    ofType(NotificationRulesActions.CREATE_NOTIFICATION_RULE),
    withLatestFrom(this.store.select(selectNotificationRulesState)),
    switchMap(([action, state]: [NotificationRulesActions.CreateNotificationRule, fromNotificationRules.State]) => {
      return this.notificationRuleService.createNotificationRule(state.notificationRuleAction.notificationRule).pipe(
        mergeMap((notificationRule: NotificationRuleModel) => {
          this.toastrService.success(texts.CREATE_NOTIFICATION_RULE_SUCCESS_NOTIFICATION);
          this.router.navigateByUrl(absoluteRoutes.SHOW_NOTIFICATION_RULE + '/' + notificationRule.id);

          return [
            {
              type: NotificationRulesActions.CREATE_NOTIFICATION_RULE_SUCCESS,
              payload: notificationRule,
            },
          ];
        }),
        catchError((errorResponse) => {
          if (ApiUtil.isBackendValidationError(errorResponse)) {
            return [
              {
                type: NotificationRulesActions.CREATE_NOTIFICATION_RULE_FAILURE,
                payload: errorResponse.map((err) => err.message),
              },
            ];
          } else {
            this.toastrService.error(texts.CREATE_NOTIFICATION_RULE_FAILURE_NOTIFICATION);
            return [
              {
                type: NotificationRulesActions.CREATE_NOTIFICATION_RULE_FAILURE,
                payload: [],
              },
            ];
          }
        }),
      );
    }),
  );

  @Effect({ dispatch: true })
  notificationRuleUpdate = this.actions.pipe(
    ofType(NotificationRulesActions.UPDATE_NOTIFICATION_RULE),
    withLatestFrom(this.store.select(selectNotificationRulesState)),
    switchMap(([action, state]: [NotificationRulesActions.UpdateNotificationRule, fromNotificationRules.State]) => {
      return this.notificationRuleService.updateNotificationRule(state.notificationRuleAction.notificationRule).pipe(
        mergeMap((notificationRule: NotificationRuleModel) => {
          this.toastrService.success(texts.UPDATE_NOTIFICATION_RULE_SUCCESS_NOTIFICATION);
          this.router.navigateByUrl(absoluteRoutes.SHOW_NOTIFICATION_RULE + '/' + notificationRule.id);

          return [
            {
              type: NotificationRulesActions.UPDATE_NOTIFICATION_RULE_SUCCESS,
              payload: notificationRule,
            },
          ];
        }),
        catchError((errorResponse) => {
          if (ApiUtil.isBackendValidationError(errorResponse)) {
            return [
              {
                type: NotificationRulesActions.UPDATE_NOTIFICATION_RULE_FAILURE,
                payload: errorResponse.map((err) => err.message),
              },
            ];
          } else {
            this.toastrService.error(texts.UPDATE_NOTIFICATION_RULE_FAILURE_NOTIFICATION);
            return [
              {
                type: NotificationRulesActions.UPDATE_NOTIFICATION_RULE_FAILURE,
                payload: [],
              },
            ];
          }
        }),
      );
    }),
  );

  @Effect({ dispatch: true })
  notificationRuleDelete = this.actions.pipe(
    ofType(NotificationRulesActions.DELETE_NOTIFICATION_RULE),
    switchMap((action: NotificationRulesActions.DeleteNotificationRule) => {
      return this.notificationRuleService.deleteNotificationRule(action.payload).pipe(
        mergeMap((result: boolean) => {
          if (result) {
            this.router.navigateByUrl(absoluteRoutes.NOTIFICATION_RULES_HOME);
            this.toastrService.success(texts.DELETE_NOTIFICATION_RULE_SUCCESS_NOTIFICATION);
            return [
              {
                type: NotificationRulesActions.DELETE_NOTIFICATION_RULE_SUCCESS,
                payload: action.payload,
              },
            ];
          } else {
            this.toastrService.error(texts.DELETE_NOTIFICATION_RULE_FAILURE_NOTIFICATION);
            return [
              {
                type: NotificationRulesActions.DELETE_NOTIFICATION_RULE_FAILURE,
              },
            ];
          }
        }),
        catchError(() => {
          this.toastrService.error(texts.DELETE_NOTIFICATION_RULE_FAILURE_NOTIFICATION);
          return [
            {
              type: NotificationRulesActions.DELETE_NOTIFICATION_RULE_FAILURE,
            },
          ];
        }),
      );
    }),
  );

  @Effect({ dispatch: true })
  historyForNotificationRuleLoad = this.actions.pipe(
    ofType(NotificationRulesActions.LOAD_HISTORY_FOR_NOTIFICATION_RULE),
    switchMap((action: NotificationRulesActions.LoadHistoryForNotificationRule) => {
      return this.notificationRuleHistoryService.getHistoryForNotificationRule(action.payload).pipe(
        mergeMap((historyForNotificationRule: HistoryModel[]) => {
          return [
            {
              type: NotificationRulesActions.LOAD_HISTORY_FOR_NOTIFICATION_RULE_SUCCESS,
              payload: historyForNotificationRule.sort((left, right) => right.id - left.id),
            },
          ];
        }),
        catchError(() => {
          this.toastrService.error(texts.LOAD_HISTORY_FOR_NOTIFICATION_RULE_FAILURE_NOTIFICATION);
          return [
            {
              type: NotificationRulesActions.LOAD_HISTORY_FOR_NOTIFICATION_RULE_FAILURE,
            },
          ];
        }),
      );
    }),
  );

  @Effect({ dispatch: true })
  notificationRulesFromHistoryLoad = this.actions.pipe(
    ofType(NotificationRulesActions.LOAD_NOTIFICATION_RULES_FROM_HISTORY),
    switchMap((action: NotificationRulesActions.LoadNotificationRulesFromHistory) => {
      return this.notificationRuleHistoryService
        .getNotificationRulesFromHistory(action.payload.leftHistoryId, action.payload.rightHistoryId)
        .pipe(
          mergeMap((notificationRuleHistoryPair: HistoryPairModel<NotificationRuleHistoryModel>) => {
            return [
              {
                type: NotificationRulesActions.LOAD_NOTIFICATION_RULES_FROM_HISTORY_SUCCESS,
                payload: {
                  leftHistory: notificationRuleHistoryPair.leftHistory,
                  rightHistory: notificationRuleHistoryPair.rightHistory,
                },
              },
            ];
          }),
          catchError(() => {
            this.toastrService.error(texts.LOAD_NOTIFICATION_RULES_FROM_HISTORY_FAILURE_NOTIFICATION);
            return [
              {
                type: NotificationRulesActions.LOAD_NOTIFICATION_RULES_FROM_HISTORY_FAILURE,
              },
            ];
          }),
        );
    }),
  );
}
