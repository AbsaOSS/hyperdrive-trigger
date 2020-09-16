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

import { AfterViewChecked, Component, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { workflowModes } from '../../../../models/enums/workflowModes.constants';
import { Subject, Subscription } from 'rxjs';
import { Action } from '@ngrx/store';
import { WorkflowFormPartsModel } from '../../../../models/workflowFormParts.model';
import {
  WorkflowAddEmptyJob,
  WorkflowCopyJob,
  WorkflowJobsReorder,
  WorkflowRemoveJob,
} from '../../../../stores/workflows/workflows.actions';
import { JobEntryModel } from '../../../../models/jobEntry.model';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent implements OnDestroy, OnInit, AfterViewChecked {
  @Input() jobsUnfold: EventEmitter<any>;
  @Input() mode: string;
  @Input() workflowFormParts: WorkflowFormPartsModel;
  @Input() jobsData: JobEntryModel[];
  @Input() changes: Subject<Action>;

  workflowModes = workflowModes;

  hiddenJobs: Set<string>;

  jobsUnfoldSubscription: Subscription;

  constructor() {
    this.hiddenJobs = new Set();
  }

  ngOnInit(): void {
    this.jobsUnfoldSubscription = this.jobsUnfold.subscribe((event) => {
      this.hiddenJobs.clear();
    });
  }

  ngAfterViewChecked(): void {
    if (this.jobsData.length == 0) {
      this.changes.next(new WorkflowAddEmptyJob(0));
    }
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
    this.changes.next(new WorkflowAddEmptyJob(this.jobsData.length));
  }

  removeJob(jobId: string): void {
    this.changes.next(new WorkflowRemoveJob(jobId));
  }

  copyJob(jobId: string): void {
    this.changes.next(new WorkflowCopyJob(jobId));
  }

  getJobName(jobId: string) {
    const jobDataOption = this.jobsData.find((job) => job.jobId === jobId);
    const jobData = !!jobDataOption ? jobDataOption.entries : [];

    const nameOption = jobData.find((value) => value.property === this.workflowFormParts.staticJobPart.property);
    return !!nameOption ? nameOption.value : '';
  }

  reorderJobs(initialJobPosition: number, updatedJobPosition: number) {
    if (initialJobPosition !== updatedJobPosition) {
      this.changes.next(new WorkflowJobsReorder({ initialJobPosition, updatedJobPosition }));
    }
  }

  ngOnDestroy(): void {
    !!this.jobsUnfoldSubscription && this.jobsUnfoldSubscription.unsubscribe();
  }
}
