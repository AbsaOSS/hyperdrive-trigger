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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AppState, selectWorkflowState} from "../../../stores/app.reducers";
import {Subscription} from "rxjs";
import {Store} from "@ngrx/store";
import {WorkflowJoinedModel} from "../../../models/workflowJoined.model";
import {StartWorkflowInitialization} from "../../../stores/workflows/workflows.actions";

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit, OnDestroy {
  paramsSubscription: Subscription;

  workflowSubscription: Subscription;
  loading: boolean = true;
  mode: string;
  workflow: WorkflowJoinedModel;

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe(parameters => {
      const id: number = parameters.id;
      const mode: string = parameters.mode;
      this.store.dispatch(new StartWorkflowInitialization({id: id, mode: mode}));
    });
  }

  ngOnInit(): void {
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.loading = state.selectedWorkflow.loading;
      this.mode = state.selectedWorkflow.mode;
      this.workflow = state.selectedWorkflow.workflow;
    });
  }

  ngOnDestroy(): void {
    this.workflowSubscription.unsubscribe();
    this.paramsSubscription.unsubscribe();
  }

}
