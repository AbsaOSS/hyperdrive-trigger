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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, Subscription } from 'rxjs';
import { WorkflowModel } from '../../../../../models/workflow.model';
import { AppState, selectNotificationRulesState } from '../../../../../stores/app.reducers';
import { Router } from '@angular/router';
import { absoluteRoutes } from '../../../../../constants/routes.constants';
import { GetNotificationRuleUsage } from '../../../../../stores/notification-rules/notification-rules.actions';

@Component({
  selector: 'app-notification-rule-usage',
  templateUrl: './notification-rule-usage.component.html',
  styleUrls: ['./notification-rule-usage.component.scss'],
})
export class NotificationRuleUsageComponent implements OnInit, OnDestroy {
  @Input('notificationId') notificationId: number;
  @Input() refreshSubject: Subject<boolean> = new Subject<boolean>();
  workflows: WorkflowModel[];
  loading = true;

  notificationsSubscription: Subscription;
  refreshSubscription: Subscription;

  constructor(private store: Store<AppState>, private router: Router) {}

  ngOnInit() {
    this.store.dispatch(new GetNotificationRuleUsage(this.notificationId));
    this.notificationsSubscription = this.store.select(selectNotificationRulesState).subscribe((state) => {
      this.loading = state.usage.loading;
      this.workflows = state.usage.workflows;
    });

    this.refreshSubscription = this.refreshSubject.subscribe((response) => {
      if (response) {
        this.onRefresh();
      }
    });
  }

  onRefresh() {
    this.store.dispatch(new GetNotificationRuleUsage(this.notificationId));
  }

  showWorkflow(id: number) {
    this.router.navigate([absoluteRoutes.SHOW_WORKFLOW, id]);
  }

  ngOnDestroy(): void {
    !!this.notificationsSubscription && this.notificationsSubscription.unsubscribe();
    !!this.refreshSubscription && this.refreshSubscription.unsubscribe();
  }
}
