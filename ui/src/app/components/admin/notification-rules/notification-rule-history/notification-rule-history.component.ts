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

import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { absoluteRoutes } from 'src/app/constants/routes.constants';
import { HistoryModel } from '../../../../models/historyModel';
import { AppState, selectNotificationRulesState } from '../../../../stores/app.reducers';
import { LoadHistoryForNotificationRule } from '../../../../stores/notification-rules/notification-rules.actions';

@Component({
  selector: 'app-notification-rule-history',
  templateUrl: './notification-rule-history.component.html',
  styleUrls: ['./notification-rule-history.component.scss'],
})
export class NotificationRuleHistoryComponent implements OnInit {
  notificationRulesSubscription: Subscription = null;
  paramsSubscription: Subscription;

  absoluteRoutes = absoluteRoutes;

  loading = true;
  notificationRuleHistory: HistoryModel[] = [];
  selected: HistoryModel[] = [];

  id: number;
  left: number = undefined;
  right: number = undefined;

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.id = parameters.id;
      this.store.dispatch(new LoadHistoryForNotificationRule(parameters.id));
    });
  }

  ngOnInit(): void {
    this.notificationRulesSubscription = this.store.select(selectNotificationRulesState).subscribe((state) => {
      this.loading = state.history.loading;
      this.notificationRuleHistory = state.history.historyEntries;
    });
  }

  isSelectable(inputHistory: HistoryModel): boolean {
    const hasEmptySlotForSelect = this.selected.length < 2;
    const isAlreadySelected = this.selected.some((history: HistoryModel) => history === inputHistory);
    return hasEmptySlotForSelect || isAlreadySelected;
  }
}
