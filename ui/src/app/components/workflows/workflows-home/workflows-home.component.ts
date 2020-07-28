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
import { Subject, Subscription } from 'rxjs';
import { AppState, selectWorkflowState } from '../../../stores/app.reducers';
import { WorkflowModel } from '../../../models/workflow.model';
import { Store } from '@ngrx/store';
import { absoluteRoutes } from '../../../constants/routes.constants';
import { RunWorkflow, SetWorkflowsFilters, SetWorkflowsSort } from '../../../stores/workflows/workflows.actions';
import { ConfirmationDialogTypes } from '../../../constants/confirmationDialogTypes.constants';
import { DeleteWorkflow, SwitchWorkflowActiveState } from '../../../stores/workflows/workflows.actions';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog/confirmation-dialog.service';
import { texts } from '../../../constants/texts.constants';
import { ResolveEnd, Router } from '@angular/router';
import { ClrDatagridColumn, ClrDatagridStateInterface } from '@clr/angular';
import { SortAttributesModel } from '../../../models/search/sortAttributes.model';
import { filter } from 'rxjs/operators';
import { workflowsHomeColumns } from 'src/app/constants/workflow.constants';

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
  routerSubscription: Subscription = null;
  workflows: WorkflowModel[] = [];
  absoluteRoutes = absoluteRoutes;
  workflowsHomeColumns = workflowsHomeColumns;

  removeWorkflowFilterSubject: Subject<any> = new Subject();
  sort: SortAttributesModel = undefined;
  filters: any[] = undefined;
  ignoreRefresh = false;

  constructor(private store: Store<AppState>, private confirmationDialogService: ConfirmationDialogService, private router: Router) {
    this.routerSubscription = router.events.pipe(filter((e) => e instanceof ResolveEnd)).subscribe((e: ResolveEnd) => {
      this.ignoreRefresh = e.state.root.component !== WorkflowsHomeComponent;
    });
  }

  ngOnInit(): void {
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.workflows = [].concat(...state.projects.map((project) => project.workflows));
      this.sort = state.workflowsSort;
      this.filters = state.workflowsFilters;
    });
  }

  deleteWorkflow(id: number) {
    this.confirmationDialogServiceSubscription = this.confirmationDialogService
      .confirm(ConfirmationDialogTypes.Delete, texts.DELETE_WORKFLOW_CONFIRMATION_TITLE, texts.DELETE_WORKFLOW_CONFIRMATION_CONTENT)
      .subscribe((confirmed) => {
        this.ignoreRefresh = true;
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
        if (confirmed) {
          this.ignoreRefresh = true;
          this.store.dispatch(new SwitchWorkflowActiveState({ id: id, currentActiveState: currentActiveState }));
        }
      });
  }

  runWorkflow(id: number) {
    this.runWorkflowDialogSubscription = this.confirmationDialogService
      .confirm(ConfirmationDialogTypes.YesOrNo, texts.RUN_WORKFLOW_CONFIRMATION_TITLE, texts.RUN_WORKFLOW_CONFIRMATION_CONTENT)
      .subscribe((confirmed) => {
        this.ignoreRefresh = true;
        if (confirmed) this.store.dispatch(new RunWorkflow(id));
      });
  }

  showWorkflow(id: number) {
    this.router.navigate([absoluteRoutes.SHOW_WORKFLOW, id]);
  }

  onClarityDgRefresh(state: ClrDatagridStateInterface) {
    if (!this.ignoreRefresh) {
      this.sort = state.sort ? new SortAttributesModel(state.sort.by as string, state.sort.reverse ? -1 : 1) : undefined;
      this.store.dispatch(new SetWorkflowsSort(this.sort));
      this.filters = state.filters ? state.filters : [];
      this.store.dispatch(new SetWorkflowsFilters(this.filters));
    }
  }

  getFilter(name: string): any | undefined {
    let filter = undefined;
    if (this.filters) {
      filter = this.filters.find((filter) => filter.field == name);
    }
    return filter ? filter.value : undefined;
  }

  getSort(name: string): any | undefined {
    return this.sort && this.sort.by == name ? this.sort.order : undefined;
  }

  clearFilters() {
    this.removeWorkflowFilterSubject.next();
  }

  clearSort() {
    !!this.sort ? (this.columns.find((_) => _.field == this.sort.by).sortOrder = 0) : undefined;
  }

  ngOnDestroy(): void {
    !!this.workflowsSubscription && this.workflowsSubscription.unsubscribe();
    !!this.confirmationDialogServiceSubscription && this.confirmationDialogServiceSubscription.unsubscribe();
    !!this.runWorkflowDialogSubscription && this.runWorkflowDialogSubscription.unsubscribe();
    !!this.routerSubscription && this.routerSubscription.unsubscribe();
  }
}
