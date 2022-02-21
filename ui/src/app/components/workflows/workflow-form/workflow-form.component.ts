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

import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { workflowModes } from 'src/app/models/enums/workflowModes.constants';
import { absoluteRoutes } from 'src/app/constants/routes.constants';
import { ConfirmationDialogTypes } from '../../../constants/confirmationDialogTypes.constants';
import { texts } from '../../../constants/texts.constants';
import {
  CreateWorkflow,
  DeleteWorkflow,
  ExportWorkflows,
  LoadJobsForRun,
  RemoveBackendValidationError,
  SwitchWorkflowActiveState,
  UpdateWorkflow,
  WorkflowChanged,
} from '../../../stores/workflows/workflows.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../../../stores/app.reducers';
import { Subscription } from 'rxjs';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog/confirmation-dialog.service';
import { PreviousRouteService } from '../../../services/previousRoute/previous-route.service';
import { Router } from '@angular/router';
import isEqual from 'lodash-es/isEqual';
import { JobTemplateModel } from '../../../models/jobTemplate.model';
import { WorkflowJoinedModel } from '../../../models/workflowJoined.model';
import { SensorModel } from '../../../models/sensor.model';
import { DagDefinitionJoinedModel } from '../../../models/dagDefinitionJoined.model';

@Component({
  selector: 'app-workflow-form',
  templateUrl: './workflow-form.component.html',
  styleUrls: ['./workflow-form.component.scss'],
})
export class WorkflowFormComponent implements OnDestroy {
  @ViewChild('workflowForm') workflowForm;
  @Input() id: number;
  @Input() mode: string;
  @Input() initialWorkflow: WorkflowJoinedModel;
  @Input() workflowForForm: WorkflowJoinedModel;
  @Input() projects: string[];
  @Input() jobTemplates: JobTemplateModel[];
  @Input() backendValidationErrors: string[];

  isDetailsAccordionHidden = false;
  isSensorAccordionHidden = false;
  isJobsAccordionHidden = false;

  workflowModes = workflowModes;
  absoluteRoutes = absoluteRoutes;

  confirmationDialogServiceSubscription: Subscription;

  constructor(
    private store: Store<AppState>,
    private confirmationDialogService: ConfirmationDialogService,
    private previousRouteService: PreviousRouteService,
    private router: Router,
  ) {}

  detailsChange(value: WorkflowJoinedModel) {
    this.workflowForForm = value;
    this.store.dispatch(new WorkflowChanged(this.workflowForForm));
  }

  sensorChange(value: SensorModel) {
    this.workflowForForm = { ...this.workflowForForm, sensor: value };
    this.store.dispatch(new WorkflowChanged(this.workflowForForm));
  }

  jobsChange(value: DagDefinitionJoinedModel) {
    this.workflowForForm = { ...this.workflowForForm, dagDefinitionJoined: value };
    this.store.dispatch(new WorkflowChanged(this.workflowForForm));
  }

  hasWorkflowChanged(): boolean {
    return !isEqual(this.workflowForForm, this.initialWorkflow);
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

  showHiddenParts() {
    this.isDetailsAccordionHidden = false;
    this.isSensorAccordionHidden = false;
    this.isJobsAccordionHidden = false;
  }

  switchWorkflowActiveState(id: number) {
    this.confirmationDialogServiceSubscription = this.confirmationDialogService
      .confirm(
        ConfirmationDialogTypes.YesOrNo,
        texts.SWITCH_WORKFLOW_ACTIVE_STATE_TITLE,
        texts.SWITCH_WORKFLOW_ACTIVE_STATE_CONTENT(this.initialWorkflow.isActive),
      )
      .subscribe((confirmed) => {
        if (confirmed)
          this.store.dispatch(
            new SwitchWorkflowActiveState({
              id: id,
              currentActiveState: this.initialWorkflow.isActive,
            }),
          );
        this.confirmationDialogServiceSubscription.unsubscribe();
      });
  }

  runWorkflow(id: number) {
    this.store.dispatch(new LoadJobsForRun(id));
  }

  exportWorkflow(id: number) {
    this.store.dispatch(new ExportWorkflows([id]));
  }

  deleteWorkflow(id: number) {
    this.confirmationDialogServiceSubscription = this.confirmationDialogService
      .confirm(ConfirmationDialogTypes.Delete, texts.DELETE_WORKFLOW_CONFIRMATION_TITLE, texts.DELETE_WORKFLOW_CONFIRMATION_CONTENT)
      .subscribe((confirmed) => {
        if (confirmed) this.store.dispatch(new DeleteWorkflow(id));
        this.confirmationDialogServiceSubscription.unsubscribe();
      });
  }

  createWorkflow() {
    if (this.workflowForm.form.valid) {
      this.confirmationDialogServiceSubscription = this.confirmationDialogService
        .confirm(ConfirmationDialogTypes.YesOrNo, texts.CREATE_WORKFLOW_CONFIRMATION_TITLE, texts.CREATE_WORKFLOW_CONFIRMATION_CONTENT)
        .subscribe((confirmed) => {
          if (confirmed) this.store.dispatch(new CreateWorkflow());
          this.confirmationDialogServiceSubscription.unsubscribe();
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
          this.confirmationDialogServiceSubscription.unsubscribe();
        });
    } else {
      this.showHiddenParts();
    }
  }

  cancelWorkflow() {
    const previousUrl = this.previousRouteService.getPreviousUrl();
    const currentUrl = this.previousRouteService.getCurrentUrl();

    !previousUrl || previousUrl === currentUrl
      ? this.router.navigateByUrl(absoluteRoutes.WORKFLOWS_HOME)
      : this.router.navigateByUrl(previousUrl);
  }

  removeBackendValidationError(index: number) {
    this.store.dispatch(new RemoveBackendValidationError(index));
  }

  ngOnDestroy(): void {
    !!this.confirmationDialogServiceSubscription && this.confirmationDialogServiceSubscription.unsubscribe();
  }
}
