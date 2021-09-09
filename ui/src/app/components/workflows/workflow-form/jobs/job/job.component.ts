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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Action } from '@ngrx/store';
import { WorkflowJobChanged, WorkflowJobTypeSwitched } from '../../../../../stores/workflows/workflows.actions';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import { JobEntryModel } from '../../../../../models/jobEntry.model';
import { jobTemplateFormConfigs } from '../../../../../constants/jobTemplates.constants';
import { WorkflowEntryUtil } from 'src/app/utils/workflowEntry/workflowEntry.util';
import { PartValidationFactory } from 'src/app/models/workflowFormParts.model';
import { JobTemplateModel } from '../../../../../models/jobTemplate.model';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss'],
})
export class JobComponent implements OnInit, OnDestroy {
  readonly JOB_TEMPLATE_PROPERTY = 'jobTemplateId';

  @Input() jobId: string;
  @Input() isShow: boolean;
  @Input() jobsData: JobEntryModel[];
  @Input() jobTemplates: JobTemplateModel[];
  @Input() changes: Subject<Action>;

  jobTemplateFormConfigs = jobTemplateFormConfigs;
  WorkflowEntryUtil = WorkflowEntryUtil;
  PartValidationFactory = PartValidationFactory;

  jobChanges: Subject<WorkflowEntryModel> = new Subject<WorkflowEntryModel>();
  jobChangesSubscription: Subscription;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.jobChangesSubscription = this.jobChanges.subscribe((jobChange) => {
      if (jobChange.property == this.JOB_TEMPLATE_PROPERTY) {
        this.changes.next(
          new WorkflowJobTypeSwitched({
            jobId: this.jobId,
            jobEntry: WorkflowEntryModelFactory.create(jobChange.property, jobChange.value),
          }),
        );
      } else {
        this.changes.next(
          new WorkflowJobChanged({ jobId: this.jobId, jobEntry: WorkflowEntryModelFactory.create(jobChange.property, jobChange.value) }),
        );
      }
    });
  }

  getJobTemplates(): Map<string, string> {
    return new Map(this.jobTemplates.map((part) => [part.id.toString(), part.name]));
  }

  getSelectedFormConfig(): string {
    const selectedJob = this.getSelectedJob();
    const selectedJobTemplate = this.jobTemplates.find((jobTemplate) => jobTemplate.id == selectedJob);
    return selectedJobTemplate?.formConfig ?? jobTemplateFormConfigs.SPARK;
  }

  getJobData(): WorkflowEntryModel[] {
    const jobDataOption = this.jobsData.find((job) => job.jobId == this.jobId);
    return !!jobDataOption ? jobDataOption.entries : [];
  }

  getSelectedJob() {
    const selected = this.getJobData().find((value) => value.property == this.JOB_TEMPLATE_PROPERTY);
    return !!selected ? selected.value : undefined;
  }

  ngOnDestroy(): void {
    !!this.jobChangesSubscription && this.jobChangesSubscription.unsubscribe();
  }
}
