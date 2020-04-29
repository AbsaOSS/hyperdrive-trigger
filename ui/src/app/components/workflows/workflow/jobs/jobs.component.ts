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

import { Component, OnDestroy } from '@angular/core';
import { workflowModes } from '../../../../models/enums/workflowModes.constants';
import { Subscription } from 'rxjs';
import cloneDeep from 'lodash/cloneDeep';
import { AppState, selectWorkflowState } from '../../../../stores/app.reducers';
import { Store } from '@ngrx/store';
import { FormPart } from '../../../../models/workflowFormParts.model';
import { WorkflowAddEmptyJob } from '../../../../stores/workflows/workflows.actions';
import { JobEntryModel } from '../../../../models/jobEntry.model';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent implements OnDestroy {
  workflowModes = workflowModes;
  mode: string;
  jobData: JobEntryModel[];
  hiddenJobs: { order: number; isHidden: boolean }[] = [];
  staticJobPart: FormPart;

  workflowSubscription: Subscription;

  constructor(private store: Store<AppState>) {
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.mode = state.workflowAction.mode;
      this.jobData = cloneDeep(state.workflowAction.workflowData.jobs).sort((first, second) => first.order - second.order);

      this.staticJobPart = state.workflowFormParts.staticJobPart;

      if (this.jobData.length == 0) {
        this.store.dispatch(new WorkflowAddEmptyJob(0));
      }
    });
  }

  trackByFn(index, item) {
    return index;
  }

  toggleJob(order: number) {
    const job = this.hiddenJobs.find((job) => job.order === order);
    job ? (job.isHidden = !job.isHidden) : this.hiddenJobs.push({ order: order, isHidden: false });
  }

  isJobHidden(order: number): boolean {
    const job = this.hiddenJobs.find((job) => job.order === order);
    return !(job ? job.isHidden : true);
  }

  addJob() {
    this.store.dispatch(new WorkflowAddEmptyJob(this.jobData.length));
  }

  getJobName(index: number) {
    const jobDataOption = this.jobData.find((job) => job.order === index);
    const jobData = !!jobDataOption ? jobDataOption.job : [];

    const nameOption = jobData.find((value) => value.property === this.staticJobPart.property);
    return !!nameOption ? nameOption.value : '';
  }

  ngOnDestroy(): void {
    this.workflowSubscription.unsubscribe();
  }
}
