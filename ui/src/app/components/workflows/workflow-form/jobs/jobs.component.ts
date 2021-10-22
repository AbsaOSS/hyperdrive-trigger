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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { JobTemplateModel } from '../../../../models/jobTemplate.model';
import { DagDefinitionJoinedModel } from '../../../../models/dagDefinitionJoined.model';
import { JobDefinitionModel, JobDefinitionModelFactory } from '../../../../models/jobDefinition.model';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent {
  @Input() isShow: boolean;
  @Input() jobs: DagDefinitionJoinedModel;
  @Output() jobsChange = new EventEmitter();
  @Input() jobTemplates: JobTemplateModel[];

  hiddenJobs: Set<number>;

  constructor() {
    this.hiddenJobs = new Set();
  }

  toggleJob(jobOrder: number): void {
    if (this.hiddenJobs.has(jobOrder)) {
      this.hiddenJobs.delete(jobOrder);
    } else {
      this.hiddenJobs.add(jobOrder);
    }
  }

  isJobHidden(jobOrder: number): boolean {
    return this.hiddenJobs.has(jobOrder);
  }

  addJob() {
    const newJob = JobDefinitionModelFactory.createDefault(this.jobs.jobDefinitions.length);
    this.jobs = { ...this.jobs, jobDefinitions: [...this.jobs.jobDefinitions, newJob] };
    this.jobsChange.emit(this.jobs);
  }

  removeJob(jobOrder: number): void {
    const jobs = [...this.jobs.jobDefinitions];
    const updatedJobs = jobs.filter((item) => item.order !== jobOrder);

    if (updatedJobs.length == 0) {
      const emptyJob = JobDefinitionModelFactory.createDefault(0);
      this.jobs = { ...this.jobs, jobDefinitions: [emptyJob] };
    } else {
      const reorderedJobs = updatedJobs.map((jobOrig) => {
        if (jobOrig.order > jobOrder) {
          return { ...jobOrig, order: jobOrig.order - 1 };
        } else {
          return jobOrig;
        }
      });
      this.jobs = { ...this.jobs, jobDefinitions: reorderedJobs };
    }
    this.jobsChange.emit(this.jobs);
  }

  copyJob(jobOrder: number): void {
    const index = this.jobs.jobDefinitions.findIndex((jobToUpdate) => jobToUpdate.order == jobOrder);
    this.jobs = {
      ...this.jobs,
      jobDefinitions: [...this.jobs.jobDefinitions, { ...this.jobs.jobDefinitions[index], order: this.jobs.jobDefinitions.length }],
    };
    this.jobsChange.emit(this.jobs);
  }

  jobChange(value: JobDefinitionModel) {
    const newJobsData = [...this.jobs.jobDefinitions];
    const index = newJobsData.findIndex((jobToUpdate) => jobToUpdate.order == value.order);
    newJobsData[index] = value;
    this.jobs = { ...this.jobs, jobDefinitions: newJobsData };
    this.jobsChange.emit(this.jobs);
  }

  reorderJobs(initialJobPosition: number, updatedJobPosition: number) {
    if (initialJobPosition !== updatedJobPosition) {
      this.jobs = { ...this.jobs, jobDefinitions: this.switchJobs(this.jobs.jobDefinitions, initialJobPosition, updatedJobPosition) };
      this.hiddenJobs = this.switchHiddenJobs(this.hiddenJobs, initialJobPosition, updatedJobPosition);
      this.jobsChange.emit(this.jobs);
    }
  }

  switchJobs(jobEntries: JobDefinitionModel[], initialJobPosition: number, updatedJobPosition: number): JobDefinitionModel[] {
    return jobEntries
      .map((jobEntry) => {
        if (jobEntry.order === initialJobPosition) {
          return { ...jobEntry, order: updatedJobPosition };
        }
        if (jobEntry.order === updatedJobPosition) {
          return { ...jobEntry, order: initialJobPosition };
        }
        return jobEntry;
      })
      .sort((projectLeft, projectRight) => projectLeft.order - projectRight.order);
  }

  switchHiddenJobs(hiddenJobs: Set<number>, initialJobPosition, updatedJobPosition): Set<number> {
    const updatedHiddenJobs: Set<number> = new Set<number>([...hiddenJobs]);

    if (hiddenJobs.has(initialJobPosition)) {
      updatedHiddenJobs.add(updatedJobPosition);
    } else {
      updatedHiddenJobs.delete(updatedJobPosition);
    }

    if (hiddenJobs.has(updatedJobPosition)) {
      updatedHiddenJobs.add(initialJobPosition);
    } else {
      updatedHiddenJobs.delete(initialJobPosition);
    }

    return updatedHiddenJobs;
  }

  trackByFn(index, job: JobDefinitionModel) {
    return job.order;
  }
}
