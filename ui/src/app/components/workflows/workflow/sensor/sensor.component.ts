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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { workflowModes } from '../../../../models/enums/workflowModes.constants';
import { Subject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectWorkflowState } from '../../../../stores/app.reducers';
import { WorkflowSensorChanged, WorkflowSensorTypeSwitched } from '../../../../stores/workflows/workflows.actions';
import { DynamicFormPart, FormPart } from '../../../../models/workflowFormParts.model';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../models/workflowEntry.model';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.scss'],
})
export class SensorComponent implements OnInit, OnDestroy {
  workflowModes = workflowModes;
  selectedSensor: string;
  mode: string;
  sensorData: WorkflowEntryModel[];
  sensorDynamicParts: DynamicFormPart[];
  sensorSwitchPart: FormPart;

  sensorChanges: Subject<WorkflowEntryModel> = new Subject<WorkflowEntryModel>();
  sensorChangesSubscription: Subscription;
  workflowSubscription: Subscription;

  constructor(private store: Store<AppState>) {
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.mode = state.workflowAction.mode;

      this.sensorDynamicParts = state.workflowFormParts.dynamicParts.sensorDynamicParts;
      this.sensorSwitchPart = state.workflowFormParts.sensorSwitchPart;
      this.sensorData = state.workflowAction.workflowData.sensor;

      const selected = this.sensorData.find((value) => value.property == this.sensorSwitchPart.property);
      this.selectedSensor = !!selected ? selected.value : undefined;
    });
  }

  ngOnInit(): void {
    this.sensorChangesSubscription = this.sensorChanges.pipe(delay(0)).subscribe((sensorChange) => {
      if (sensorChange.property == this.sensorSwitchPart.property) {
        this.store.dispatch(new WorkflowSensorTypeSwitched(WorkflowEntryModelFactory.create(sensorChange.property, sensorChange.value)));
      } else {
        this.store.dispatch(new WorkflowSensorChanged(WorkflowEntryModelFactory.create(sensorChange.property, sensorChange.value)));
      }
    });
  }

  getSensorTypes(): string[] {
    return this.sensorDynamicParts.map((component) => component.name);
  }

  getSelectedSensorComponent(): FormPart[] {
    const sensorComponent = this.sensorDynamicParts.find((sp) => sp.name == this.selectedSensor);
    return sensorComponent ? sensorComponent.parts : this.sensorDynamicParts[0].parts;
  }

  getValue(prop: string) {
    const val = this.sensorData.find((value) => value.property == prop);
    return !!val ? val.value : undefined;
  }

  ngOnDestroy(): void {
    !!this.sensorChangesSubscription && this.sensorChangesSubscription.unsubscribe();
    !!this.workflowSubscription && this.workflowSubscription.unsubscribe();
  }
}
