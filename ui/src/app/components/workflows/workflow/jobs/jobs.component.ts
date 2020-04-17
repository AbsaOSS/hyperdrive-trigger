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

import {AfterViewInit, Component, Input} from '@angular/core';
import {WorkflowJoinedModel} from "../../../../models/workflowJoined.model";
import {workflowModes} from "../../../../models/enums/workflowModes.constants";
import {Subject, Subscription} from "rxjs";
import {JobDefinitionModel} from "../../../../models/jobDefinition.model";
import {ComponentModel} from "../../../../models/workflowComponents.model";
import {distinctUntilChanged} from "rxjs/operators";
import cloneDeep from 'lodash/cloneDeep';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements AfterViewInit {
  @Input() workflowUpdates: Subject<WorkflowJoinedModel>;
  @Input() mode: string;
  @Input() workflow: WorkflowJoinedModel;
  @Input() jobComponents: ComponentModel[];

  workflowModes = workflowModes;
  hiddenJobs: {order: number, isHidden: boolean}[] = [];

  jobsChanges: Subject<{job: JobDefinitionModel, id: number}> = new Subject<{job: JobDefinitionModel, id: number}>();
  jobsChangesSubscription: Subscription;

  constructor() { }

  ngAfterViewInit(): void {
    this.jobsChangesSubscription = this.jobsChanges.pipe(
      distinctUntilChanged()
    ).subscribe(jobChange => {
      let copiedWorkflow: WorkflowJoinedModel = cloneDeep(this.workflow);
      let copiedValue = cloneDeep(jobChange.job);

      copiedWorkflow.dagDefinitionJoined.jobDefinitions[jobChange.id] = copiedValue;
      this.workflowUpdates.next(copiedWorkflow);
    });
  }

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
}
