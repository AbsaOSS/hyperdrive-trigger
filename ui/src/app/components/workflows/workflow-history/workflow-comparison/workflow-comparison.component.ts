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
import { WorkflowFormPartsModel } from '../../../../models/workflowFormParts.model';
import { LoadWorkflowsFromHistory } from '../../../../stores/workflows/workflows.actions';
import { WorkflowFormDataModel } from '../../../../models/workflowFormData.model';
import { HistoryModel } from '../../../../models/historyModel';

@Component({
  selector: 'app-workflow-comparison',
  templateUrl: './workflow-comparison.component.html',
  styleUrls: ['./workflow-comparison.component.scss'],
})
export class WorkflowComparisonComponent implements OnInit, OnDestroy {
  workflowsSubscription: Subscription = null;
  paramsSubscription: Subscription;

  workflowModes = workflowModes;

  workflowDataLeft: WorkflowFormDataModel;
  workflowDataRight: WorkflowFormDataModel;
  workflowHistoryLeft: HistoryModel;
  workflowHistoryRight: HistoryModel;
  workflowFormParts: WorkflowFormPartsModel;

  loading = true;
  changes = new Subject<Action>();

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
      this.workflowFormParts = state.history.workflowFormParts;
      this.workflowDataLeft = state.history.leftWorkflowHistoryData;
      this.workflowDataRight = state.history.rightWorkflowHistoryData;
      this.workflowHistoryLeft = state.history.leftWorkflowHistory;
      this.workflowHistoryRight = state.history.rightWorkflowHistory;
      this.loading = state.history.loading;
    });
  }

  isLoadedSuccessfully(): boolean {
    return (
      !!this.workflowFormParts &&
      !!this.workflowDataLeft &&
      !!this.workflowDataRight &&
      !!this.workflowHistoryLeft &&
      !!this.workflowHistoryRight
    );
  }

  ngOnDestroy(): void {
    !!this.workflowsSubscription && this.workflowsSubscription.unsubscribe();
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
  }
}
