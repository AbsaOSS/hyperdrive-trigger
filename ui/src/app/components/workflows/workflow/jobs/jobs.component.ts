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

import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {WorkflowJoinedModel} from "../../../../models/workflowJoined.model";
import {workflowModes} from "../../../../models/enums/workflowModes.constants";
import {Subject, Subscription} from "rxjs";
import {JobDefinitionModel} from "../../../../models/jobDefinition.model";
import {ComponentModel} from "../../../../models/workflowComponents.model";
import {distinctUntilChanged} from "rxjs/operators";
import cloneDeep from 'lodash/cloneDeep';
import {AppState, selectWorkflowState} from "../../../../stores/app.reducers";
import {Store} from "@ngrx/store";
import {DynamicFormPart, FormPart} from "../../../../models/workflowFormParts.model";
import {
  WorkflowAddEmptyJob,
  WorkflowSensorChanged,
  WorkflowSensorCleaned
} from "../../../../stores/workflows/workflows.actions";

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {

  workflowSubscription: Subscription;

  mode: string;
  jobData: {order: number, job: {property: string, value: any}[]}[];

  workflowModes = workflowModes;
  hiddenJobs: {order: number, isHidden: boolean}[] = [];

  constructor(private store: Store<AppState>) {
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {

      this.jobData = state.workflowAction.workflowChanges.jobs;
      if(this.jobData.length == 0) {
          this.store.dispatch(new WorkflowAddEmptyJob(0));
      }
    });
  }

  ngOnInit(): void {}

  trackByFn(index, item) {
    return index;
  }

  toggleJob(order: number) {
    let job = this.hiddenJobs.find(job => job.order === order);
    job ? job.isHidden = !job.isHidden : this.hiddenJobs.push({order: order, isHidden: false});
  }

  isJobHidden(order: number): boolean {
    let job = this.hiddenJobs.find(job => job.order === order);
    return !(job ? job.isHidden : true);
  }

  addJob() {
    this.store.dispatch(new WorkflowAddEmptyJob(this.jobData.length));
  }
}
