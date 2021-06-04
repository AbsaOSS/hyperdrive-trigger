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

import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppState, selectWorkflowState } from '../../../stores/app.reducers';
import { Subject, Subscription } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { StartWorkflowInitialization, ImportWorkflow } from '../../../stores/notificationRules/notificationRules.actions';
import { notificationRuleModes } from '../../../models/enums/notificationRuleModes.constants';
import { absoluteRoutes } from '../../../constants/routes.constants';
import { PreviousRouteService } from '../../../services/previousRoute/previous-route.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog/confirmation-dialog.service';
import { WorkflowEntryModel } from '../../../models/notificationRuleEntry.model';
import { JobEntryModel } from '../../../models/jobEntry.model';
import { WorkflowFormPartsModel } from '../../../models/notificationRuleFormParts.model';
import { delay } from 'rxjs/operators';
import { WorkflowFormDataModel } from '../../../models/notificationRuleFormData.model';

@Component({
  selector: 'app-notificationRule',
  templateUrl: './notificationRule.component.html',
  styleUrls: ['./notificationRule.component.scss'],
})
export class NotificationRuleComponent implements OnInit, OnDestroy {
  @ViewChild('notificationRuleForm') notificationRuleForm;
  @Output() jobsUnfold: EventEmitter<any> = new EventEmitter();

  loading = true;
  mode: string;
  id: number;
  isWorkflowActive: boolean;
  backendValidationErrors: string[];

  notificationRuleModes = notificationRuleModes;
  absoluteRoutes = absoluteRoutes;

  paramsSubscription: Subscription;
  notificationRuleSubscription: Subscription;

  notificationRuleData: {
    details: WorkflowEntryModel[];
    sensor: WorkflowEntryModel[];
    jobs: JobEntryModel[];
  };
  initialWorkflowData: WorkflowFormDataModel;
  notificationRuleFormParts: WorkflowFormPartsModel;

  changes: Subject<Action> = new Subject<Action>();
  changesSubscription: Subscription;

  constructor(
    private store: Store<AppState>,
    private confirmationDialogService: ConfirmationDialogService,
    private previousRouteService: PreviousRouteService,
    private router: Router,
    route: ActivatedRoute,
  ) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      if (parameters.mode == this.notificationRuleModes.IMPORT) {
        this.store.dispatch(new ImportWorkflow());
      } else {
        this.store.dispatch(new StartWorkflowInitialization({ id: parameters.id, mode: parameters.mode }));
      }
    });
  }

  ngOnInit(): void {
    this.notificationRuleSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.loading = state.notificationRuleAction.loading;
      this.mode = state.notificationRuleAction.mode;
      this.id = state.notificationRuleAction.id;
      this.isWorkflowActive = !!state.notificationRuleAction.notificationRule ? state.notificationRuleAction.notificationRule.isActive : false;
      this.backendValidationErrors = state.notificationRuleAction.backendValidationErrors;
      this.notificationRuleFormParts = state.notificationRuleAction.notificationRuleFormParts;
      this.notificationRuleData = state.notificationRuleAction.notificationRuleFormData;
      this.initialWorkflowData = state.notificationRuleAction.initialWorkflowFormData;
    });
    this.changesSubscription = this.changes.subscribe((state) => {
      this.store.dispatch(state);
    });
  }

  ngOnDestroy(): void {
    !!this.notificationRuleSubscription && this.notificationRuleSubscription.unsubscribe();
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
  }
}
