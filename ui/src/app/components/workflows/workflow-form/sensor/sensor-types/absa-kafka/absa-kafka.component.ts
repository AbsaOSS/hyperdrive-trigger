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
import { PartValidationFactory } from '../../../../../../models/workflowFormParts.model';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../../models/workflowEntry.model';
import { WorkflowSensorChanged } from '../../../../../../stores/workflows/workflows.actions';
import { WorkflowEntryUtil } from 'src/app/utils/workflowEntry/workflowEntry.util';

@Component({
  selector: 'app-absa-kafka',
  templateUrl: './absa-kafka.component.html',
  styleUrls: ['./absa-kafka.component.scss'],
})
export class AbsaKafkaComponent implements OnInit, OnDestroy {
  @Input() isShow: boolean;
  @Input() sensorData: WorkflowEntryModel[];
  @Input() changes: Subject<Action>;

  WorkflowEntryUtil = WorkflowEntryUtil;
  PartValidationFactory = PartValidationFactory;

  sensorChanges: Subject<WorkflowEntryModel> = new Subject<WorkflowEntryModel>();
  sensorChangesSubscription: Subscription;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.sensorChangesSubscription = this.sensorChanges.subscribe((sensorChange) => {
      this.changes.next(new WorkflowSensorChanged(WorkflowEntryModelFactory.create(sensorChange.property, sensorChange.value)));
    });
  }

  ngOnDestroy(): void {
    !!this.sensorChangesSubscription && this.sensorChangesSubscription.unsubscribe();
  }
}
