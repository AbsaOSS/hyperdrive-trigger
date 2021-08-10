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
import { WorkflowSensorChanged, WorkflowSensorTypeSwitched } from '../../../../stores/workflows/workflows.actions';
import { PartValidationFactory, WorkflowFormPartsModel } from '../../../../models/workflowFormParts.model';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../models/workflowEntry.model';
import { sensorTypes, sensorTypesArray } from '../../../../constants/sensorTypes.constants';
import { WorkflowEntryUtil } from 'src/app/utils/workflowEntry/workflowEntry.util';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.scss'],
})
export class SensorComponent implements OnInit, OnDestroy {
  @Input() isShow: boolean;
  @Input() workflowFormParts: WorkflowFormPartsModel;
  @Input() sensorData: WorkflowEntryModel[];
  @Input() changes: Subject<Action>;

  WorkflowEntryUtil = WorkflowEntryUtil;
  PartValidationFactory = PartValidationFactory;

  workflowModes = workflowModes;
  sensorTypesArray = sensorTypesArray;
  sensorTypes = sensorTypes;

  sensorChanges: Subject<WorkflowEntryModel> = new Subject<WorkflowEntryModel>();
  sensorChangesSubscription: Subscription;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.sensorChangesSubscription = this.sensorChanges.subscribe((sensorChange) => {
      if (sensorChange.property == this.workflowFormParts.sensorSwitchPart.property) {
        this.changes.next(new WorkflowSensorTypeSwitched(WorkflowEntryModelFactory.create(sensorChange.property, sensorChange.value)));
      } else {
        this.changes.next(new WorkflowSensorChanged(WorkflowEntryModelFactory.create(sensorChange.property, sensorChange.value)));
      }
    });
  }

  getSelectedSensorType(): string {
    const selected = this.sensorData.find((value) => value.property == 'properties.sensorType');
    return !!selected ? selected.value : sensorTypes.ABSA_KAFKA;
  }

  ngOnDestroy(): void {
    !!this.sensorChangesSubscription && this.sensorChangesSubscription.unsubscribe();
  }
}
