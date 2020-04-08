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

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit, AfterViewInit, OnDestroy {
  paramsSubscription: Subscription;

  workflowSubscription: Subscription;
  loading: boolean = true;
  mode: string;
  workflow: WorkflowJoinedModel;

  workflowModes = workflowModes;

  isDetailsAccordionHidden = false;
  isSensorAccordionHidden = false;
  isJobsAccordionHidden = false;

  modelChanges: Subject<{property: string, value: any}> = new Subject<{property: string, value: any}>();
  modelSubscription: Subscription;

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
      this.workflow = (JSON.parse(JSON.stringify(state.workflowAction.actionWorkflow)));
    });
  }

  ngAfterViewInit(): void {
    this.modelSubscription = this.modelChanges.pipe(
      distinctUntilChanged()
    ).subscribe(newValue => {
      console.log('1111111');
      console.log(newValue.value);
      console.log(newValue.property);
      // this.workflow[newValue.property] = newValue.value;
      let w = (JSON.parse(JSON.stringify(this.workflow)));
      this.set(w, newValue.property, newValue.value);
      console.log(w);
      console.log('2222222');


      this.store.dispatch(new WorkflowActionChanged(w));
      console.log(this.workflow);
      console.log('modelChanged');
    });
  }

  set(obj, path, val) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const lastObj = keys.reduce((obj, key) =>
        obj[key] = obj[key] || {},
      obj);
    lastObj[lastKey] = val;
  }

  ngOnDestroy(): void {
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
