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
import { Subject, Subscription } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { AppState, selectWorkflowState } from '../../../../stores/app.reducers';
import { ActivatedRoute } from '@angular/router';
import { workflowModes } from '../../../../models/enums/workflowModes.constants';
import { LoadWorkflowsFromHistory } from '../../../../stores/workflows/workflows.actions';
import { WorkflowHistoryModel } from '../../../../models/historyModel';
import { JobTemplateModel } from '../../../../models/jobTemplate.model';
import { absoluteRoutes } from 'src/app/constants/routes.constants';

@Component({
  selector: 'app-workflow-comparison',
  templateUrl: './workflow-comparison.component.html',
  styleUrls: ['./workflow-comparison.component.scss'],
})
export class WorkflowComparisonComponent implements OnInit, OnDestroy {
  loading = true;
  workflowHistoryLeft: WorkflowHistoryModel;
  workflowHistoryRight: WorkflowHistoryModel;
  jobTemplates: JobTemplateModel[];

  changes = new Subject<Action>();
  workflowsSubscription: Subscription = null;
  paramsSubscription: Subscription;

  workflowModes = workflowModes;
  absoluteRoutes = absoluteRoutes;

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.store.dispatch(
        new LoadWorkflowsFromHistory({
          leftWorkflowHistoryId: parameters.historyIdLeft,
          rightWorkflowHistoryId: parameters.historyIdRight,
        }),
      );
    });
  }

  ngOnInit(): void {
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.workflowHistoryLeft = state.history.leftWorkflowHistory;
      this.workflowHistoryRight = state.history.rightWorkflowHistory;
      this.jobTemplates = state.jobTemplates;
      this.loading = state.history.loading;
    });
  }

  isLoadedSuccessfully(): boolean {
    return !!this.workflowHistoryLeft && !!this.workflowHistoryRight;
  }

  ngOnDestroy(): void {
    !!this.workflowsSubscription && this.workflowsSubscription.unsubscribe();
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
  }
}
