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
import { workflowModes } from '../../../../../models/enums/workflowModes.constants';
import { FormPart, WorkflowFormPartsModel } from '../../../../../models/workflowFormParts.model';
import { Action } from '@ngrx/store';
import { WorkflowJobChanged, WorkflowJobTypeSwitched } from '../../../../../stores/workflows/workflows.actions';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import { JobEntryModel } from '../../../../../models/jobEntry.model';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss'],
})
export class JobComponent implements OnInit, OnDestroy {
  @Input() jobId: string;
  @Input() mode: string;
  @Input() workflowFormParts: WorkflowFormPartsModel;
  @Input() jobsData: JobEntryModel[];
  @Input() changes: Subject<Action>;

  workflowModes = workflowModes;

  jobChanges: Subject<WorkflowEntryModel> = new Subject<WorkflowEntryModel>();
  jobChangesSubscription: Subscription;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.jobChangesSubscription = this.jobChanges.subscribe((jobChange) => {
      if (jobChange.property == this.workflowFormParts.jobSwitchPart.property) {
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

  getJobTypes(): Map<string, string> {
    return new Map(this.workflowFormParts.dynamicParts.jobDynamicParts.map((part) => [part.value, part.label]));
  }

  getSelectedJobComponent(): FormPart[] {
    const jobDynamicPart = this.workflowFormParts.dynamicParts.jobDynamicParts.find((jdp) => jdp.value == this.getSelectedJob());
    return jobDynamicPart ? jobDynamicPart.parts : this.workflowFormParts.dynamicParts.jobDynamicParts[0].parts;
  }

  getJobData(): WorkflowEntryModel[] {
    const jobDataOption = this.jobsData.find((job) => job.jobId == this.jobId);
    return !!jobDataOption ? jobDataOption.entries : [];
  }

  getSelectedJob() {
    const selected = this.getJobData().find((value) => value.property == this.workflowFormParts.jobSwitchPart.property);
    return !!selected ? selected.value : undefined;
  }

  getValue(prop: string) {
    const val = this.getJobData().find((value) => value.property == prop);
    return !!val ? val.value : undefined;
  }

  ngOnDestroy(): void {
    !!this.jobChangesSubscription && this.jobChangesSubscription.unsubscribe();
  }
}
