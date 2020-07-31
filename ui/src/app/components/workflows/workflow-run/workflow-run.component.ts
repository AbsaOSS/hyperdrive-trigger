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
import { Store } from '@ngrx/store';
import { AppState, selectWorkflowState } from '../../../stores/app.reducers';
import { Subscription } from 'rxjs';
import { JobForRunModel } from '../../../models/jobForRun.model';
import { RunJobs, RunJobsCancel } from '../../../stores/workflows/workflows.actions';

@Component({
  selector: 'app-workflow-run',
  templateUrl: './workflow-run.component.html',
  styleUrls: ['./workflow-run.component.scss'],
})
export class WorkflowRunComponent implements OnInit, OnDestroy {
  workflowsSubscription: Subscription = null;

  loading = true;
  isOpen = false;
  jobs: JobForRunModel[] = [];
  workflowId: number = undefined;
  selectedJobs: number[] = [];

  constructor(private store: Store<AppState>) {
    // do nothing
  }

  ngOnInit(): void {
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.loading = state.jobsForRun.loading;
      this.isOpen = state.jobsForRun.isOpen;
      this.workflowId = state.jobsForRun.workflowId;
      this.jobs = !!state.jobsForRun.jobs ? state.jobsForRun.jobs : [];
      this.jobs = [...this.jobs].sort((left, right) => left.order - right.order);
      this.selectedJobs = [];
      !!this.jobs && this.jobs.forEach((job) => this.selectedJobs.push(job.id));
    });
  }

  changeSelection(id: number) {
    this.isSelected(id) ? (this.selectedJobs = this.selectedJobs.filter((selectedJob) => selectedJob !== id)) : this.selectedJobs.push(id);
  }

  isSelected(id: number): boolean {
    return this.selectedJobs.some((selectedJob) => selectedJob === id);
  }

  close(isSubmit: boolean) {
    if (this.isOpen) {
      if (isSubmit) {
        this.store.dispatch(new RunJobs({ workflowId: this.workflowId, jobs: this.selectedJobs }));
      } else {
        this.store.dispatch(new RunJobsCancel());
      }
    }
  }

  ngOnDestroy(): void {
    !!this.workflowsSubscription && this.workflowsSubscription.unsubscribe();
  }
}
