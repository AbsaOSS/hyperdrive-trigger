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

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { WorkflowEntryModel } from '../../../models/workflowEntry.model';
import { JobEntryModel } from '../../../models/jobEntry.model';
import { WorkflowFormPartsModel } from '../../../models/workflowFormParts.model';
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
} from '../../../stores/workflows/workflows.actions';
import { Action, Store } from '@ngrx/store';
import { AppState, selectWorkflowState } from '../../../stores/app.reducers';
import { Subject, Subscription } from 'rxjs';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog/confirmation-dialog.service';
import { PreviousRouteService } from '../../../services/previousRoute/previous-route.service';
import { Router } from '@angular/router';
import cloneDeep from 'lodash-es/cloneDeep';
import isEqual from 'lodash-es/isEqual';
import { WorkflowFormDataModel } from '../../../models/workflowFormData.model';

@Component({
  selector: 'app-workflow-form',
  templateUrl: './workflow-form.component.html',
  styleUrls: ['./workflow-form.component.scss'],
})
export class WorkflowFormComponent implements OnInit, OnDestroy {
  @ViewChild('workflowForm') workflowForm;
  @Output() jobsUnfold: EventEmitter<any> = new EventEmitter();
  @Input() workflowData: WorkflowFormDataModel;
  @Input() initialWorkflowData: WorkflowFormDataModel;
  @Input() workflowFormParts: WorkflowFormPartsModel;
  @Input() id: number;
  @Input() mode: string;
  @Input() backendValidationErrors: string[];
  @Input() changes: Subject<Action>;
  @Input() isWorkflowActive;

  workflowModes = workflowModes;
  absoluteRoutes = absoluteRoutes;

  isDetailsAccordionHidden = false;
  isSensorAccordionHidden = false;
  isJobsAccordionHidden = false;

  projects: string[] = [];

  paramsSubscription: Subscription;
  workflowSubscription: Subscription;
  confirmationDialogServiceSubscription: Subscription = null;
  workflowsSubscription: Subscription = null;

  constructor(
    private store: Store<AppState>,
    private confirmationDialogService: ConfirmationDialogService,
    private previousRouteService: PreviousRouteService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.projects = state.projects.map((project) => project.name);
    });
  }

  hasWorkflowChanged(): boolean {
    return !(
      this.areWorkflowEntriesEqual(this.workflowData.details, this.initialWorkflowData.details) &&
      this.areWorkflowEntriesEqual(this.workflowData.sensor, this.initialWorkflowData.sensor) &&
      this.areJobsEqual(this.workflowData.jobs, this.initialWorkflowData.jobs)
    );
  }

  areWorkflowEntriesEqual(leftEntries: WorkflowEntryModel[], rightEntries: WorkflowEntryModel[]): boolean {
    function compareEntries(left: WorkflowEntryModel[], right: WorkflowEntryModel[]): boolean[] {
      return left.map((leftEntry) =>
        right.some((rightEntry) => isEqual(rightEntry.value, leftEntry.value) && rightEntry.property == leftEntry.property),
      );
    }

    return [...compareEntries(leftEntries, rightEntries), ...compareEntries(rightEntries, leftEntries)].every((entry) => entry);
  }

  areJobsEqual(leftJobEntry: JobEntryModel[], rightJobEntry: JobEntryModel[]): boolean {
    if (leftJobEntry.length != rightJobEntry.length) {
      return false;
    } else {
      const leftJobEntrySorted = leftJobEntry.slice().sort((left, right) => left.order - right.order);
      const rightJobEntrySorted = rightJobEntry.slice().sort((left, right) => left.order - right.order);
      return leftJobEntrySorted
        .map((job, index) => this.areWorkflowEntriesEqual(job.entries, rightJobEntrySorted[index].entries))
        .every((entry) => entry);
    }
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
    this.jobsUnfold.emit();
  }

  getJobsData(): JobEntryModel[] {
    return cloneDeep(this.workflowData.jobs).sort((first, second) => first.order - second.order);
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

  exportWorkflow(id: number) {
    this.store.dispatch(new ExportWorkflows([id]));
  }

  deleteWorkflow(id: number) {
    this.confirmationDialogServiceSubscription = this.confirmationDialogService
      .confirm(ConfirmationDialogTypes.Delete, texts.DELETE_WORKFLOW_CONFIRMATION_TITLE, texts.DELETE_WORKFLOW_CONFIRMATION_CONTENT)
      .subscribe((confirmed) => {
        if (confirmed) this.store.dispatch(new DeleteWorkflow(id));
      });
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
    !!this.workflowSubscription && this.workflowSubscription.unsubscribe();
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
    !!this.confirmationDialogServiceSubscription && this.confirmationDialogServiceSubscription.unsubscribe();
    !!this.workflowsSubscription && this.workflowsSubscription.unsubscribe();
  }
}
