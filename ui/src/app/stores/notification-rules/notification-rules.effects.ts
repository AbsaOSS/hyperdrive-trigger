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
import { catchError, mergeMap, switchMap } from 'rxjs/operators';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import { NotificationRuleService } from '../../services/notification-rule/notificationRule.service';
import { NotificationRuleModel } from '../../models/notificationRule.model';

import { ToastrService } from 'ngx-toastr';
import { texts } from '../../constants/texts.constants';
import { absoluteRoutes } from '../../constants/routes.constants';
import { Router } from '@angular/router';

@Injectable()
export class NotificationRulesEffects {
  constructor(
    private actions: Actions,
    private notificationRuleService: NotificationRuleService,
    private toastrService: ToastrService,
    private router: Router,
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
}
