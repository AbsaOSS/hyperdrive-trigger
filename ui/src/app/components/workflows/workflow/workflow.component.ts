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
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  DeleteWorkflow,
  CreateWorkflow,
  StartWorkflowInitialization,
  UpdateWorkflow,
  SwitchWorkflowActiveState,
  RemoveBackendValidationError,
  LoadJobsForRun,
} from '../../../stores/workflows/workflows.actions';
import { workflowModes } from '../../../models/enums/workflowModes.constants';
import { absoluteRoutes } from '../../../constants/routes.constants';
import { PreviousRouteService } from '../../../services/previousRoute/previous-route.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog/confirmation-dialog.service';
import { ConfirmationDialogTypes } from '../../../constants/confirmationDialogTypes.constants';
import { texts } from '../../../constants/texts.constants';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss'],
})
export class WorkflowComponent implements OnInit, OnDestroy {
  @ViewChild('workflowForm') workflowForm;
  @Output() jobsUnfold: EventEmitter<any> = new EventEmitter();

  loading = true;
  mode: string;
  id: number;
  isWorkflowActive: boolean;
  backendValidationErrors: string[];

  workflowModes = workflowModes;
  absoluteRoutes = absoluteRoutes;

  isDetailsAccordionHidden = false;
  isSensorAccordionHidden = false;
  isJobsAccordionHidden = false;

  paramsSubscription: Subscription;
  workflowSubscription: Subscription;
  confirmationDialogServiceSubscription: Subscription = null;
  runWorkflowDialogSubscription: Subscription = null;

  constructor(
    private store: Store<AppState>,
    private confirmationDialogService: ConfirmationDialogService,
    private previousRouteService: PreviousRouteService,
    private router: Router,
    route: ActivatedRoute,
  ) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.store.dispatch(new StartWorkflowInitialization({ id: parameters.id, mode: parameters.mode }));
    });
  }

  ngOnInit(): void {
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.loading = state.workflowAction.loading;
      this.mode = state.workflowAction.mode;
      this.id = state.workflowAction.id;
      this.isWorkflowActive = !!state.workflowAction.workflow ? state.workflowAction.workflow.isActive : false;
      this.backendValidationErrors = state.workflowAction.backendValidationErrors;
    });
  }

  toggleDetailsAccordion() {
    this.isDetailsAccordionHidden = !this.isDetailsAccordionHidden;
  }

  toggleSensorAccordion() {
    this.isSensorAccordionHidden = !this.isSensorAccordionHidden;
  }

  toggleJobsAccordion() {
    this.isJobsAccordionHidden = !this.isJobsAccordionHidden;
  }

  removeBackendValidationError(index: number) {
    this.store.dispatch(new RemoveBackendValidationError(index));
  }

  cancelWorkflow() {
    const previousUrl = this.previousRouteService.getPreviousUrl();
    const currentUrl = this.previousRouteService.getCurrentUrl();

    !previousUrl || previousUrl === currentUrl
      ? this.router.navigateByUrl(absoluteRoutes.WORKFLOWS_HOME)
      : this.router.navigateByUrl(previousUrl);
  }

  deleteWorkflow(id: number) {
    this.confirmationDialogServiceSubscription = this.confirmationDialogService
      .confirm(ConfirmationDialogTypes.Delete, texts.DELETE_WORKFLOW_CONFIRMATION_TITLE, texts.DELETE_WORKFLOW_CONFIRMATION_CONTENT)
      .subscribe((confirmed) => {
        if (confirmed) this.store.dispatch(new DeleteWorkflow(id));
      });
  }

  switchWorkflowActiveState(id: number) {
    this.confirmationDialogServiceSubscription = this.confirmationDialogService
      .confirm(
        ConfirmationDialogTypes.YesOrNo,
        texts.SWITCH_WORKFLOW_ACTIVE_STATE_TITLE,
        texts.SWITCH_WORKFLOW_ACTIVE_STATE_CONTENT(this.isWorkflowActive),
      )
      .subscribe((confirmed) => {
        if (confirmed)
          this.store.dispatch(
            new SwitchWorkflowActiveState({
              id: id,
              currentActiveState: this.isWorkflowActive,
            }),
          );
      });
  }

  runWorkflow(id: number) {
    this.store.dispatch(new LoadJobsForRun(id));
  }

  createWorkflow() {
    if (this.workflowForm.form.valid) {
      this.confirmationDialogServiceSubscription = this.confirmationDialogService
        .confirm(ConfirmationDialogTypes.YesOrNo, texts.CREATE_WORKFLOW_CONFIRMATION_TITLE, texts.CREATE_WORKFLOW_CONFIRMATION_CONTENT)
        .subscribe((confirmed) => {
          if (confirmed) this.store.dispatch(new CreateWorkflow());
        });
    } else {
      this.showHiddenParts();
    }
  }

  updateWorkflow() {
    if (this.workflowForm.form.valid) {
      this.confirmationDialogServiceSubscription = this.confirmationDialogService
        .confirm(ConfirmationDialogTypes.YesOrNo, texts.UPDATE_WORKFLOW_CONFIRMATION_TITLE, texts.UPDATE_WORKFLOW_CONFIRMATION_CONTENT)
        .subscribe((confirmed) => {
          if (confirmed) this.store.dispatch(new UpdateWorkflow());
        });
    } else {
      this.showHiddenParts();
    }
  }

  showHiddenParts() {
    this.isDetailsAccordionHidden = false;
    this.isSensorAccordionHidden = false;
    this.isJobsAccordionHidden = false;
    this.jobsUnfold.emit();
  }

  ngOnDestroy(): void {
    !!this.workflowSubscription && this.workflowSubscription.unsubscribe();
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
    !!this.confirmationDialogServiceSubscription && this.confirmationDialogServiceSubscription.unsubscribe();
    !!this.runWorkflowDialogSubscription && this.runWorkflowDialogSubscription.unsubscribe();
  }
}
