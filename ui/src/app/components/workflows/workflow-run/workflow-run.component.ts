import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectWorkflowState } from '../../../stores/app.reducers';
import { Subscription } from 'rxjs';
import { JobForRunModel } from '../../../models/jobForRun.model';

@Component({
  selector: 'app-workflow-run',
  templateUrl: './workflow-run.component.html',
  styleUrls: ['./workflow-run.component.scss'],
})
export class WorkflowRunComponent implements OnInit, OnDestroy {
  workflowsSubscription: Subscription = null;

  isOpen = false;
  jobs: JobForRunModel[] = [];
  selectedJobs: number[] = [];

  constructor(private store: Store<AppState>) {
    console.log('constructor');
  }

  ngOnInit(): void {
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.isOpen = state.jobsForRun.isOpen;
      this.jobs = !!state.jobsForRun.jobs ? state.jobsForRun.jobs : [];
      this.jobs = [...this.jobs].sort((left, right) => left.order - right.order)
      !!this.jobs && this.jobs.forEach((job) => this.selectedJobs.push(job.id));
    });
  }

  changeSelection(id: number) {
    this.isSelected(id) ? (this.selectedJobs = this.selectedJobs.filter((selectedJob) => selectedJob !== id)) : this.selectedJobs.push(id);
    console.log(this.selectedJobs);
  }

  isSelected(id: number): boolean {
    return this.selectedJobs.some((selectedJob) => selectedJob === id);
  }

  close(isSubmit: boolean) {
    if(isSubmit) {
      // this.store.dispatch();
    } else {
      // this.store.dispatch();
    }
  }

  ngOnDestroy(): void {
    !!this.workflowsSubscription && this.workflowsSubscription.unsubscribe();
  }
}
