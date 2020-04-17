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
import {JobDefinitionModel} from "../../../../../models/jobDefinition.model";
import {Subject, Subscription} from "rxjs";
import {distinctUntilChanged} from "rxjs/operators";
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import {workflowModes} from "../../../../../models/enums/workflowModes.constants";
import {ComponentModel} from "../../../../../models/workflowComponents.model";

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent implements AfterViewInit {
  @Input() mode: string;
  @Input() jobIndex: number;
  @Input() jobsChanges: Subject<{job: JobDefinitionModel, id: number}>;
  @Input() jobDefinition: JobDefinitionModel;
  @Input() jobComponents: ComponentModel[];

  workflowModes = workflowModes;

  jobChanges: Subject<{property: string, value: any}> = new Subject<{property: string, value: any}>();
  jobChangesSubscription: Subscription;

  constructor() {}

  ngAfterViewInit(): void {
    this.jobChangesSubscription = this.jobChanges.pipe(
      distinctUntilChanged()
    ).subscribe(jobChange => {
      let copiedJob: JobDefinitionModel = cloneDeep(this.jobDefinition);
      let copiedValue = cloneDeep(jobChange.value);

      set(copiedJob, jobChange.property, copiedValue);

      this.jobsChanges.next({job: copiedJob, id: this.jobIndex})
    });
  }

  getJobTypes(): string[] {
    return this.jobComponents.map(component => component.name)
  }

  getSelectedJobComponent(): ComponentModel {
    // return this.jobComponents.find(sc => sc.name == this.jobDefinition.jobType.name)
    let jobComponent = this.jobComponents.find(sc => sc.name == this.jobDefinition.jobType.name)
    return jobComponent ? jobComponent : this.jobComponents[0];
  }


}
