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
import { WorkflowEntryUtil } from 'src/app/utils/workflowEntry/workflowEntry.util';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../../../models/workflowEntry.model';
import { WorkflowJobChanged, WorkflowSensorChanged } from '../../../../../../../stores/workflows/workflows.actions';
import { PartValidationFactory } from 'src/app/models/workflowFormParts.model';

@Component({
  selector: 'app-spark',
  templateUrl: './spark.component.html',
  styleUrls: ['./spark.component.scss'],
})
export class SparkComponent implements OnInit, OnDestroy {
  @Input() isShow: boolean;
  @Input() jobData: WorkflowEntryModel[];
  @Input() jobId: string;
  @Input() changes: Subject<Action>;

  WorkflowEntryUtil = WorkflowEntryUtil;
  PartValidationFactory = PartValidationFactory;

  jobChanges: Subject<WorkflowEntryModel> = new Subject<WorkflowEntryModel>();
  jobChangesSubscription: Subscription;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.jobChangesSubscription = this.jobChanges.subscribe((jobChange) => {
      this.changes.next(
        new WorkflowJobChanged({
          jobId: this.jobId,
          jobEntry: WorkflowEntryModelFactory.create(jobChange.property, jobChange.value),
        }),
      );
    });
  }

  ngOnDestroy(): void {
    !!this.jobChangesSubscription && this.jobChangesSubscription.unsubscribe();
  }
}
