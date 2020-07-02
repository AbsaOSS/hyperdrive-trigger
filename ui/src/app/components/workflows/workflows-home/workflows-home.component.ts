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
import { Subscription, Subject } from 'rxjs';
import { AppState, selectWorkflowState } from '../../../stores/app.reducers';
import { WorkflowModel } from '../../../models/workflow.model';
import { ClrDatagridSortOrder } from '@clr/angular';
import { Store } from '@ngrx/store';
import { absoluteRoutes } from '../../../constants/routes.constants';
import { workflowsHomeColumns } from '../../../constants/workflow.constants';
import { RunWorkflow } from '../../../stores/workflows/workflows.actions';
import { ConfirmationDialogTypes } from '../../../constants/confirmationDialogTypes.constants';
import { DeleteWorkflow, SwitchWorkflowActiveState } from '../../../stores/workflows/workflows.actions';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog/confirmation-dialog.service';
import { texts } from '../../../constants/texts.constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workflows-home',
  templateUrl: './workflows-home.component.html',
  styleUrls: ['./workflows-home.component.scss'],
})
export class WorkflowsHomeComponent implements OnInit, OnDestroy {
  confirmationDialogServiceSubscription: Subscription = null;
  runWorkflowDialogSubscription: Subscription = null;
  workflowsSubscription: Subscription = null;
  workflows: WorkflowModel[] = [];

  sorted = false;
  ascSort = ClrDatagridSortOrder.ASC;

  absoluteRoutes = absoluteRoutes;
  workflowsHomeColumns = workflowsHomeColumns;

  removeWorkflowFilterSubject: Subject<any> = new Subject();

  constructor(private store: Store<AppState>, private confirmationDialogService: ConfirmationDialogService, private router: Router) {}

  ngOnInit(): void {
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.workflows = [].concat(...state.projects.map((project) => project.workflows));
    });
  }

  deleteWorkflow(id: number) {
    this.confirmationDialogServiceSubscription = this.confirmationDialogService
      .confirm(ConfirmationDialogTypes.Delete, texts.DELETE_WORKFLOW_CONFIRMATION_TITLE, texts.DELETE_WORKFLOW_CONFIRMATION_CONTENT)
      .subscribe((confirmed) => {
        if (confirmed) this.store.dispatch(new DeleteWorkflow(id));
      });
  }

  switchWorkflowActiveState(id: number, currentActiveState: boolean) {
    this.confirmationDialogServiceSubscription = this.confirmationDialogService
      .confirm(
        ConfirmationDialogTypes.YesOrNo,
        texts.SWITCH_WORKFLOW_ACTIVE_STATE_TITLE,
        texts.SWITCH_WORKFLOW_ACTIVE_STATE_CONTENT(currentActiveState),
      )
      .subscribe((confirmed) => {
        if (confirmed) this.store.dispatch(new SwitchWorkflowActiveState({ id: id, currentActiveState: currentActiveState }));
      });
  }

  runWorkflow(id: number) {
    this.runWorkflowDialogSubscription = this.confirmationDialogService
      .confirm(ConfirmationDialogTypes.YesOrNo, texts.RUN_WORKFLOW_CONFIRMATION_TITLE, texts.RUN_WORKFLOW_CONFIRMATION_CONTENT)
      .subscribe((confirmed) => {
        if (confirmed) this.store.dispatch(new RunWorkflow(id));
      });
  }

  showWorkflow(id: number) {
    this.router.navigate([absoluteRoutes.SHOW_WORKFLOW, id]);
  }

  clearFilters() {
    this.removeWorkflowFilterSubject.next();
  }

  clearSort() {
    this.sorted = !this.sorted;
  }

  ngOnDestroy(): void {
    !!this.workflowsSubscription && this.workflowsSubscription.unsubscribe();
    !!this.confirmationDialogServiceSubscription && this.confirmationDialogServiceSubscription.unsubscribe();
    !!this.runWorkflowDialogSubscription && this.runWorkflowDialogSubscription.unsubscribe();
  }
}
