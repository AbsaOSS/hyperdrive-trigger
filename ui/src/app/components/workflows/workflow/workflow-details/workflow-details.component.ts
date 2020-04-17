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
import {distinctUntilChanged} from "rxjs/operators";
import cloneDeep from 'lodash/cloneDeep';

@Component({
  selector: 'app-workflow-details',
  templateUrl: './workflow-details.component.html',
  styleUrls: ['./workflow-details.component.scss']
})
export class WorkflowDetailsComponent implements AfterViewInit {
  @Input() workflowUpdates: Subject<WorkflowJoinedModel>;
  @Input() mode: string;
  @Input() workflow: WorkflowJoinedModel;

  workflowModes = workflowModes;

  detailsChanges: Subject<{property: string, value: any}> = new Subject<{property: string, value: any}>();
  detailsChangesSubscription: Subscription;

  constructor() {}

  ngAfterViewInit(): void {
    this.detailsChangesSubscription = this.detailsChanges.pipe(
      distinctUntilChanged()
    ).subscribe(newValue => {
      let copiedWorkflow = cloneDeep(this.workflow);
      copiedWorkflow[newValue.property] = newValue.value;
      this.workflowUpdates.next(copiedWorkflow)
    });
  }

}
