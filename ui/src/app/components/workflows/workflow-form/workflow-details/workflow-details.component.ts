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
import { workflowModes } from '../../../../models/enums/workflowModes.constants';
import { Subject, Subscription } from 'rxjs';
import { Action } from '@ngrx/store';
import { WorkflowDetailsChanged } from '../../../../stores/workflows/workflows.actions';
import { FormPart } from '../../../../models/workflowFormParts.model';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../models/workflowEntry.model';

@Component({
  selector: 'app-workflow-details',
  templateUrl: './workflow-details.component.html',
  styleUrls: ['./workflow-details.component.scss'],
})
export class WorkflowDetailsComponent implements OnInit, OnDestroy {
  @Input() mode: string;
  @Input() parts: FormPart[];
  @Input() data: WorkflowEntryModel[];
  @Input() changes: Subject<Action>;
  @Input() projects: string[];

  workflowModes = workflowModes;

  detailsChanges: Subject<WorkflowEntryModel> = new Subject<WorkflowEntryModel>();
  detailsChangesSubscription: Subscription;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.detailsChangesSubscription = this.detailsChanges.subscribe((newValue) => {
      this.changes.next(new WorkflowDetailsChanged(WorkflowEntryModelFactory.create(newValue.property, newValue.value)));
    });
  }

  getValue(prop: string) {
    const val = this.data.find((value) => value.property == prop);
    return !!val ? val.value : undefined;
  }

  ngOnDestroy(): void {
    !!this.detailsChangesSubscription && this.detailsChangesSubscription.unsubscribe();
  }
}
