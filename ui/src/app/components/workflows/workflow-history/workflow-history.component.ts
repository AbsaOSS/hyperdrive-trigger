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

import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HistoryModel } from '../../../models/historyModel';
import { Store } from '@ngrx/store';
import { AppState, selectWorkflowState } from '../../../stores/app.reducers';
import { ActivatedRoute } from '@angular/router';
import { absoluteRoutes } from 'src/app/constants/routes.constants';
import { LoadHistoryForWorkflow } from '../../../stores/workflows/workflows.actions';

@Component({
  selector: 'app-workflow-history',
  templateUrl: './workflow-history.component.html',
  styleUrls: ['./workflow-history.component.scss'],
})
export class WorkflowHistoryComponent implements OnInit {
  workflowsSubscription: Subscription = null;
  paramsSubscription: Subscription;

  absoluteRoutes = absoluteRoutes;

  loading = true;
  workflowHistory: HistoryModel[] = [];
  selected: HistoryModel[] = [];

  id: number;
  left: number = undefined;
  right: number = undefined;

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.id = parameters.id;
      this.store.dispatch(new LoadHistoryForWorkflow(parameters.id));
    });
  }

  ngOnInit(): void {
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.loading = state.history.loading;
      this.workflowHistory = state.history.workflowHistory;
    });
  }

  isSelectable(inputHistory: HistoryModel): boolean {
    const hasEmptySlotForSelect = this.selected.length < 2;
    const isAlreadySelected = this.selected.some((history: HistoryModel) => history === inputHistory);
    return hasEmptySlotForSelect || isAlreadySelected;
  }
}
