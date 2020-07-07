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
import { RunWorkflow, GetProjects } from '../../../stores/workflows/workflows.actions';
import { TableSearchRequestModel } from '../../../models/search/tableSearchRequest.model';
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

  absoluteRoutes = absoluteRoutes;
  workflowsHomeColumns = workflowsHomeColumns;

  removeWorkflowFilterSubject: Subject<any> = new Subject();

  constructor(private store: Store<AppState>, private confirmationDialogService: ConfirmationDialogService, private router: Router) {}

  ngOnInit(): void {
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.workflows = [].concat(...state.projects.map((project) => project.workflows));
      this.total = this.workflows.length;
      this.loading = state.loading;
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
    !!this.sort ? (this.columns.find((_) => _.field === this.sort.by).sortOrder = 0) : undefined;
  }

  onClarityDgRefresh(state: ClrDatagridStateInterface) {
    this.sort = state.sort ? new SortAttributesModel(state.sort.by as string, state.sort.reverse ? -1 : 1) : undefined;
    this.pageFrom = state.page.from < 0 ? 0 : state.page.from;
    this.pageSize = state.page.size;
    this.filters = state.filters ? state.filters : [];

    this.refresh();
  }

  refresh() {
    const workflowSearchRequestModel: TableSearchRequestModel = {
      from: this.pageFrom,
      size: this.pageSize,
      sort: this.sort,
      containsFilterAttributes: this.filters.filter((f) => f instanceof ContainsFilterAttributes),
      intRangeFilterAttributes: null,
      dateTimeRangeFilterAttributes: null,
      equalsMultipleFilterAttributes: null,
    };

    this.store.dispatch(new GetProjects(workflowSearchRequestModel));
  }

  ngOnDestroy(): void {
    !!this.workflowsSubscription && this.workflowsSubscription.unsubscribe();
    !!this.confirmationDialogServiceSubscription && this.confirmationDialogServiceSubscription.unsubscribe();
    !!this.runWorkflowDialogSubscription && this.runWorkflowDialogSubscription.unsubscribe();
  }
}
