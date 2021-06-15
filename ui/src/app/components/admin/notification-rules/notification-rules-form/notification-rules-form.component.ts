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

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectNotificationRulesState, selectWorkflowState } from '../../../../stores/app.reducers';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CreateNotificationRule,
  DeleteNotificationRule,
  GetNotificationRule,
  NotificationRuleChanged,
  RemoveNotificationRuleBackendValidationError,
  SetEmptyNotificationRule,
  UpdateNotificationRule,
} from '../../../../stores/notification-rules/notification-rules.actions';
import { WorkflowEntryModel } from '../../../../models/workflowEntry.model';
import { PartValidation, PartValidationFactory } from '../../../../models/workflowFormParts.model';
import { NotificationRuleModel } from '../../../../models/notificationRule.model';
import { ConfirmationDialogTypes } from '../../../../constants/confirmationDialogTypes.constants';
import { texts } from '../../../../constants/texts.constants';
import { ConfirmationDialogService } from '../../../../services/confirmation-dialog/confirmation-dialog.service';
import { notificationRuleModes } from '../../../../models/enums/notificationRuleModes.constants';
import { absoluteRoutes } from '../../../../constants/routes.constants';
import { PreviousRouteService } from '../../../../services/previousRoute/previous-route.service';
import * as deepEquals from 'fast-deep-equal';
import { StatusModel } from '../../../../models/status.model';
import { dagInstanceStatuses } from '../../../../models/enums/dagInstanceStatuses.constants';
import { InitializeWorkflows } from '../../../../stores/workflows/workflows.actions';
@Component({
  selector: 'app-notification-rules-form',
  templateUrl: './notification-rules-form.component.html',
  styleUrls: ['./notification-rules-form.component.scss'],
})
export class NotificationRulesFormComponent implements OnInit, OnDestroy {
  @ViewChild('notificationRulesForm') notificationRulesForm;
  mode: string;
  paramsSubscription: Subscription;
  changesSubscription: Subscription;
  notificationRuleSubscription: Subscription = null;
  workflowsSubscription: Subscription = null;
  confirmationDialogServiceSubscription: Subscription = null;
  changes: Subject<WorkflowEntryModel> = new Subject<WorkflowEntryModel>();

  initialNotificationRule: NotificationRuleModel;
  notificationRule: NotificationRuleModel;
  notificationRuleStatuses: string[];
  loading = false;
  backendValidationErrors: string[];
  optional: PartValidation = PartValidationFactory.create(false, 1000, 1);
  required: PartValidation = PartValidationFactory.create(true);
  notificationRuleModes = notificationRuleModes;
  absoluteRoutes = absoluteRoutes;
  projects: string[] = [];

  constructor(
    private store: Store<AppState>,
    private confirmationDialogService: ConfirmationDialogService,
    route: ActivatedRoute,
    private previousRouteService: PreviousRouteService,
    private router: Router,
  ) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.mode = parameters.mode;
      if (parameters.mode == notificationRuleModes.CREATE) {
        this.store.dispatch(new SetEmptyNotificationRule());
      } else if (parameters.mode == notificationRuleModes.SHOW || parameters.mode == notificationRuleModes.EDIT) {
        this.store.dispatch(new GetNotificationRule(parameters.id));
      }
    });
    this.changesSubscription = this.changes.subscribe((state) => {
      this.store.dispatch(new NotificationRuleChanged(state));
    });
    this.store.dispatch(new InitializeWorkflows());
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
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.projects = state.projects.map((project) => project.name);
    });
  }

  ngOnDestroy(): void {
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
    !!this.changesSubscription && this.changesSubscription.unsubscribe();
    !!this.notificationRuleSubscription && this.notificationRuleSubscription.unsubscribe();
    !!this.workflowsSubscription && this.workflowsSubscription.unsubscribe();
    !!this.confirmationDialogServiceSubscription && this.confirmationDialogServiceSubscription.unsubscribe();
  }

  createNotificationRule(): void {
    if (this.notificationRulesForm.form.valid) {
      this.confirmationDialogServiceSubscription = this.confirmationDialogService
        .confirm(
          ConfirmationDialogTypes.YesOrNo,
          texts.CREATE_NOTIFICATION_RULE_CONFIRMATION_TITLE,
          texts.CREATE_NOTIFICATION_RULE_CONFIRMATION_CONTENT,
        )
        .subscribe((confirmed) => {
          if (confirmed) this.store.dispatch(new CreateNotificationRule());
        });
    }
  }

  updateNotificationRule(): void {
    if (this.notificationRulesForm.form.valid) {
      this.confirmationDialogServiceSubscription = this.confirmationDialogService
        .confirm(
          ConfirmationDialogTypes.YesOrNo,
          texts.UPDATE_NOTIFICATION_RULE_CONFIRMATION_TITLE,
          texts.UPDATE_NOTIFICATION_RULE_CONFIRMATION_CONTENT,
        )
        .subscribe((confirmed) => {
          if (confirmed) this.store.dispatch(new UpdateNotificationRule());
        });
    }
  }

  deleteNotificationRule(id: number): void {
    this.confirmationDialogServiceSubscription = this.confirmationDialogService
      .confirm(
        ConfirmationDialogTypes.Delete,
        texts.DELETE_NOTIFICATION_RULE_CONFIRMATION_TITLE,
        texts.DELETE_NOTIFICATION_RULE_CONFIRMATION_CONTENT,
      )
      .subscribe((confirmed) => {
        if (confirmed) this.store.dispatch(new DeleteNotificationRule(id));
      });
  }

  formHasChanged(): boolean {
    return !deepEquals(this.initialNotificationRule, this.notificationRule);
  }

  cancel(): void {
    const previousUrl = this.previousRouteService.getPreviousUrl();
    const currentUrl = this.previousRouteService.getCurrentUrl();

    !previousUrl || previousUrl === currentUrl
      ? this.router.navigateByUrl(absoluteRoutes.NOTIFICATION_RULES_HOME)
      : this.router.navigateByUrl(previousUrl);
  }

  removeBackendValidationError(index: number): void {
    this.store.dispatch(new RemoveNotificationRuleBackendValidationError(index));
  }

  isReadOnlyMode(): boolean {
    return this.mode == notificationRuleModes.SHOW;
  }

  getStatuses(): Map<string, string> {
    return new Map([dagInstanceStatuses.SUCCEEDED, dagInstanceStatuses.FAILED].map((status) => [status.name, status.name]));
  }
}
