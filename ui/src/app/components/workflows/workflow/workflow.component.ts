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

import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AppState, selectWorkflowState} from "../../../stores/app.reducers";
import {Subject, Subscription} from "rxjs";
import {Store} from "@ngrx/store";
import {WorkflowJoinedModel} from "../../../models/workflowJoined.model";
import {StartWorkflowInitialization, WorkflowActionChanged} from "../../../stores/workflows/workflows.actions";
import {workflowModes} from "../../../models/enums/workflowModes.constants";
import {distinctUntilChanged} from "rxjs/operators";
import cloneDeep from 'lodash/cloneDeep';
import {WorkflowComponentsModel} from "../../../models/workflowComponents.model";

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit, AfterViewInit, OnDestroy {
  workflowModes = workflowModes;

  isDetailsAccordionHidden = false;
  isSensorAccordionHidden = false;
  isJobsAccordionHidden = false;

  loading: boolean = true;
  mode: string;
  workflow: WorkflowJoinedModel;
  workflowComponents: WorkflowComponentsModel;

  workflowUpdates: Subject<WorkflowJoinedModel> = new Subject<WorkflowJoinedModel>();
  workflowUpdatesSubscription: Subscription;
  paramsSubscription: Subscription;
  workflowSubscription: Subscription;

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe(parameters => {
      const id: number = parameters.id;
      const mode: string = parameters.mode;
      this.store.dispatch(new StartWorkflowInitialization({id: id, mode: mode}));
    });
  }

  ngOnInit(): void {
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.loading = state.workflowAction.loading;
      this.mode = state.workflowAction.mode;
      this.workflow = cloneDeep(state.workflowAction.actionWorkflow);
      this.workflowComponents = state.workflowComponents
    });
  }

  ngAfterViewInit(): void {
    this.workflowUpdatesSubscription = this.workflowUpdates.pipe(
      distinctUntilChanged()
    ).subscribe(newWorkflow => {
      this.store.dispatch(new WorkflowActionChanged(newWorkflow));
    });
  }

  ngOnDestroy(): void {
    this.workflowUpdatesSubscription.unsubscribe();
    this.workflowSubscription.unsubscribe();
    this.paramsSubscription.unsubscribe();
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

}
