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
import { Store } from '@ngrx/store';
import { AppState, selectNotificationRulesState } from '../../../../stores/app.reducers';
import { ActivatedRoute } from '@angular/router';
import { GetNotificationRule } from '../../../../stores/notification-rules/notification-rules.actions';
import { WorkflowEntryModel } from '../../../../models/workflowEntry.model';
import { PartValidation, PartValidationFactory } from '../../../../models/workflowFormParts.model';
import { NotificationRuleModel } from '../../../../models/notificationRule.model';

@Component({
  selector: 'app-notification-rules-cru',
  templateUrl: './notification-rules-cru.component.html',
  styleUrls: ['./notification-rules-cru.component.scss'],
})
export class NotificationRulesCruComponent implements OnInit, OnDestroy {
  paramsSubscription: Subscription;
  notificationRuleSubscription: Subscription = null;
  changes: Subject<WorkflowEntryModel> = new Subject<WorkflowEntryModel>();

  notificationRule: NotificationRuleModel;
  loading = false;

  isShow = true;
  partValidation: PartValidation = PartValidationFactory.create(true, 1000, 1);

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.store.dispatch(new GetNotificationRule(parameters.id));
    });
  }

  ngOnInit(): void {
    this.notificationRuleSubscription = this.store.select(selectNotificationRulesState).subscribe((state) => {
      this.loading = state.notificationRuleAction.loading;
      this.notificationRule = state.notificationRuleAction.notificationRule;
    });
  }

  ngOnDestroy(): void {
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
    !!this.notificationRuleSubscription && this.notificationRuleSubscription.unsubscribe();
  }
}
