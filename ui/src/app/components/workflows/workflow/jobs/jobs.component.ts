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

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { workflowModes } from '../../../../models/enums/workflowModes.constants';
import { Subscription } from 'rxjs';
import cloneDeep from 'lodash/cloneDeep';
import { AppState, selectWorkflowState } from '../../../../stores/app.reducers';
import { Store } from '@ngrx/store';
import { FormPart } from '../../../../models/workflowFormParts.model';
import { WorkflowAddEmptyJob, WorkflowRemoveJob } from '../../../../stores/workflows/workflows.actions';
import { JobEntryModel } from '../../../../models/jobEntry.model';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent implements OnDestroy, OnInit {
  @Input() jobsUnfold: EventEmitter<any>;
  workflowModes = workflowModes;
  mode: string;
  jobData: JobEntryModel[];
  hiddenJobs: Set<string>;
  staticJobPart: FormPart;

  workflowSubscription: Subscription;
  jobsUnfoldSubscription: Subscription;

  constructor(private store: Store<AppState>) {
    this.hiddenJobs = new Set();
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.mode = state.workflowAction.mode;
      this.jobData = cloneDeep(state.workflowAction.workflowData.jobs).sort((first, second) => first.order - second.order);

      this.staticJobPart = state.workflowFormParts.staticJobPart;

      if (this.jobData.length == 0) {
        this.store.dispatch(new WorkflowAddEmptyJob(0));
      }
    });
  }

  ngOnInit(): void {
    this.jobsUnfoldSubscription = this.jobsUnfold.subscribe((event) => {
      this.hiddenJobs.clear();
    })
  }

  trackByFn(index, item: JobEntryModel) {
    return item.jobId;
  }

  toggleJob(jobId: string): void {
    if (this.hiddenJobs.has(jobId)) {
      this.hiddenJobs.delete(jobId);
    } else {
      this.hiddenJobs.add(jobId);
    }
  }

  isJobHidden(jobId: string): boolean {
    return this.hiddenJobs.has(jobId);
  }

  addJob() {
    this.store.dispatch(new WorkflowAddEmptyJob(this.jobData.length));
  }

  removeJob(jobId: string): void {
    this.store.dispatch(new WorkflowRemoveJob(jobId));
  }

  getJobName(jobId: string) {
    const jobDataOption = this.jobData.find((job) => job.jobId === jobId);
    const jobData = !!jobDataOption ? jobDataOption.entries : [];

    const nameOption = jobData.find((value) => value.property === this.staticJobPart.property);
    return !!nameOption ? nameOption.value : '';
  }

  ngOnDestroy(): void {
    !!this.workflowSubscription && this.workflowSubscription.unsubscribe();
    !!this.jobsUnfoldSubscription && this.jobsUnfoldSubscription.unsubscribe();
  }
}
