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
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { NotificationRuleModel } from '../../../../models/notificationRule.model';
import { AppState, selectNotificationRulesState } from '../../../../stores/app.reducers';
import { notificationRuleModes } from '../../../../models/enums/notificationRuleModes.constants';

import {
  GetNotificationRule,
  NotificationRuleChanged,
  SetEmptyNotificationRule,
  RevertNotificationRule,
} from '../../../../stores/notification-rules/notification-rules.actions';

@Component({
  selector: 'app-notification-rule',
  templateUrl: './notification-rule.component.html',
  styleUrls: ['./notification-rule.component.scss'],
})
export class NotificationRuleComponent implements OnInit, OnDestroy {
  loading = true;
  backendValidationErrors: string[];
  initialNotificationRule: NotificationRuleModel;
  notificationRule: NotificationRuleModel;
  notificationRuleStatuses: string[];
  mode: string;

  paramsSubscription: Subscription;
  notificationRuleSubscription: Subscription;

  constructor(private store: Store<AppState>, private router: Router, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.mode = parameters.mode;
      if (parameters.mode == notificationRuleModes.CREATE) {
        this.store.dispatch(new SetEmptyNotificationRule());
      } else if (parameters.mode == notificationRuleModes.SHOW || parameters.mode == notificationRuleModes.EDIT) {
        this.store.dispatch(new GetNotificationRule(parameters.id));
      } else if (parameters.mode == notificationRuleModes.REVERT) {
        this.store.dispatch(new RevertNotificationRule(parameters.id));
      }
    });
  }

  ngOnInit(): void {
    this.notificationRuleSubscription = this.store.select(selectNotificationRulesState).subscribe((state) => {
      this.loading = state.notificationRuleAction.loading;
      this.notificationRule = state.notificationRuleAction.notificationRule;
      if (this.notificationRule) {
        this.notificationRuleStatuses = Object.assign([], state.notificationRuleAction.notificationRule.statuses);
      }
      this.initialNotificationRule = state.notificationRuleAction.initialNotificationRule;
      this.backendValidationErrors = state.notificationRuleAction.backendValidationErrors;
    });
  }

  notificationRuleChange(value: NotificationRuleModel) {
    this.notificationRule = value;
    this.store.dispatch(new NotificationRuleChanged(this.notificationRule));
  }

  ngOnDestroy(): void {
    !!this.notificationRuleSubscription && this.notificationRuleSubscription.unsubscribe();
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
  }
}
