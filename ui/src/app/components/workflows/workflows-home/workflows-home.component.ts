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

import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { AppState, selectWorkflowState } from '../../../stores/app.reducers';
import { WorkflowModel } from '../../../models/workflow.model';
import { ClrDatagridColumn, ClrDatagridSortOrder, ClrDatagridStateInterface } from '@clr/angular';
import { Store } from '@ngrx/store';
import { absoluteRoutes } from '../../../constants/routes.constants';
import { workflowsHomeColumns } from '../../../constants/workflow.constants';
import { RunWorkflow, SetDatagridState } from '../../../stores/workflows/workflows.actions';
import { SortAttributesModel } from '../../../models/search/sortAttributes.model';
import { ContainsFilterAttributes } from '../../../models/search/containsFilterAttributes.model';
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
  @ViewChildren(ClrDatagridColumn) columns: QueryList<ClrDatagridColumn>;

  confirmationDialogServiceSubscription: Subscription = null;
  runWorkflowDialogSubscription: Subscription = null;
  workflowsSubscription: Subscription = null;
  workflows: WorkflowModel[] = [];

  page = 1;
  pageFrom = 0;
  pageSize = 0;
  total = 0;
  sort: SortAttributesModel = null;

  ascSort = ClrDatagridSortOrder.ASC;
  loading = true;
  filters: any[] = [];
  appState;
  projectFilterValue;
  workflowFilterValue;

  absoluteRoutes = absoluteRoutes;
  workflowsHomeColumns = workflowsHomeColumns;

  removeWorkflowFilterSubject: Subject<any> = new Subject();

  constructor(private store: Store<AppState>, private confirmationDialogService: ConfirmationDialogService, private router: Router) {}

  ngOnInit(): void {
    this.getState();

    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.workflows = [].concat(...state.projects.map((project) => project.workflows));

      if (this.projectFilterValue && this.workflowFilterValue) {
        this.workflows = this.workflows.filter(
          (projects) => projects.name.includes(this.workflowFilterValue) && projects.project.includes(this.projectFilterValue),
        );
      } else if (this.workflowFilterValue && !this.projectFilterValue) {
        this.workflows = this.workflows.filter((projects) => projects.name.includes(this.workflowFilterValue));
      } else if (this.projectFilterValue && !this.workflowFilterValue) {
        this.workflows = this.workflows.filter((projects) => projects.project.includes(this.projectFilterValue));
      } else {
        this.workflows = this.workflows;
      }
      this.total = this.workflows.length;
      this.loading = state.loading;
    });
    this.appState ? console.log(this.appState) : console.log('On init I am not there');

    console.log('project filter value ' + this.projectFilterValue);
    console.log('workflow name filter value ' + this.workflowFilterValue);
    console.log(this.workflows);
    // console.log(this.appState=);
  }

  getState() {
    if (localStorage.getItem('dgState')) {
      this.appState = JSON.parse(localStorage.getItem('dgState'));

      if (this.appState.filters && this.appState.filters.length === 2) {
        this.workflowFilterValue =
          this.appState.filters[0].field === workflowsHomeColumns.WORKFLOW_NAME ? this.appState.filters[0].value : undefined;
        this.projectFilterValue =
          this.appState.filters[1].field === workflowsHomeColumns.PROJECT_NAME ? this.appState.filters[1].value : undefined;
      } else if (this.appState.filters && this.appState.filters.length === 1) {
        this.workflowFilterValue =
          this.appState.filters[0].field === workflowsHomeColumns.WORKFLOW_NAME ? this.appState.filters[0].value : undefined;
        this.projectFilterValue =
          this.appState.filters[0].field === workflowsHomeColumns.PROJECT_NAME ? this.appState.filters[0].value : undefined;
      }
    }
  }

  setState(state: ClrDatagridStateInterface) {
    sessionStorage.setItem('dgState', JSON.stringify(state));
  }

  setPersistedState() {
    localStorage.setItem('dgState', JSON.stringify(this.appState));
    // this.store.dispatch(new SetDatagridState(this.appState));
  }

  onClarityDgRefresh(state: ClrDatagridStateInterface) {
    this.appState = state;
    this.setState(this.appState);
  }

  deleteWorkflow(id: number) {
    this.confirmationDialogServiceSubscription = this.confirmationDialogService
      .confirm(ConfirmationDialogTypes.Delete, texts.DELETE_WORKFLOW_CONFIRMATION_TITLE, texts.DELETE_WORKFLOW_CONFIRMATION_CONTENT)
      .subscribe((confirmed) => {
        if (confirmed) this.store.dispatch(new DeleteWorkflow(id));
      });
    this.setPersistedState();
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
    this.setPersistedState();
  }

  runWorkflow(id: number) {
    this.runWorkflowDialogSubscription = this.confirmationDialogService
      .confirm(ConfirmationDialogTypes.YesOrNo, texts.RUN_WORKFLOW_CONFIRMATION_TITLE, texts.RUN_WORKFLOW_CONFIRMATION_CONTENT)
      .subscribe((confirmed) => {
        if (confirmed) this.store.dispatch(new RunWorkflow(id));
      });
    this.setPersistedState();
  }

  showWorkflow(id: number) {
    this.router.navigate([absoluteRoutes.SHOW_WORKFLOW, id]);
  }

  clearFilters() {
    this.removeWorkflowFilterSubject.next();
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.workflows = [].concat(...state.projects.map((project) => project.workflows));
      this.total = this.workflows.length;
      this.loading = state.loading;
    });
    localStorage.removeItem('dgState');
  }

  clearSort() {
    !!this.sort ? (this.columns.find((_) => _.field === this.sort.by).sortOrder = 0) : undefined;
  }

  ngOnDestroy(): void {
    !!this.workflowsSubscription && this.workflowsSubscription.unsubscribe();
    !!this.confirmationDialogServiceSubscription && this.confirmationDialogServiceSubscription.unsubscribe();
    !!this.runWorkflowDialogSubscription && this.runWorkflowDialogSubscription.unsubscribe();
    // localStorage.clear();
    // localStorage.removeItem('dgState');
    sessionStorage.clear();
  }
}
