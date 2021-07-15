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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { NotificationRuleHistoryModel } from '../../../../../models/notificationRuleHistoryModel';
import { notificationRuleModes } from '../../../../../models/enums/notificationRuleModes.constants';
import { AppState, selectNotificationRulesState } from '../../../../../stores/app.reducers';
import { LoadNotificationRulesFromHistory } from '../../../../../stores/notification-rules/notification-rules.actions';

@Component({
  selector: 'app-notification-rule-comparison',
  templateUrl: './notification-rule-comparison.component.html',
  styleUrls: ['./notification-rule-comparison.component.scss'],
})
export class NotificationRuleComparisonComponent implements OnInit, OnDestroy {
  notificationRulesSubscription: Subscription = null;
  paramsSubscription: Subscription;

  notificationRuleModes = notificationRuleModes;

  leftHistory: NotificationRuleHistoryModel;
  rightHistory: NotificationRuleHistoryModel;

  loading = true;
  changes = new Subject<Action>();

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.store.dispatch(
        new LoadNotificationRulesFromHistory({
          leftHistoryId: parameters.historyIdLeft,
          rightHistoryId: parameters.historyIdRight,
        }),
      );
    });
  }

  ngOnInit(): void {
    this.notificationRulesSubscription = this.store.select(selectNotificationRulesState).subscribe((state) => {
      this.leftHistory = state.history.leftHistory;
      this.rightHistory = state.history.rightHistory;
      this.loading = state.history.loading;
    });
  }

  isLoadedSuccessfully(): boolean {
    return !!this.leftHistory && !!this.rightHistory;
  }

  ngOnDestroy(): void {
    !!this.notificationRulesSubscription && this.notificationRulesSubscription.unsubscribe();
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
  }
}
