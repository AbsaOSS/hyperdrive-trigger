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

import {AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {WorkflowJoinedModel} from "../../../../models/workflowJoined.model";
import {workflowModes} from "../../../../models/enums/workflowModes.constants";
import {Subject, Subscription} from "rxjs";
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import {distinctUntilChanged} from "rxjs/operators";
import {Store} from "@ngrx/store";
import {AppState, selectWorkflowState} from "../../../../stores/app.reducers";
import {
  WorkflowDetailsChanged,
  WorkflowSensorChanged,
  WorkflowSensorCleaned
} from "../../../../stores/workflows/workflows.actions";
import {log} from "util";
import {DynamicFormPart, DynamicFormParts, FormPart} from "../../../../models/workflowFormParts.model";
import {Form} from "@angular/forms";

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SensorComponent implements OnInit, AfterViewInit {
  mode: string;

  sensorDynamicParts: DynamicFormPart[];
  dynamicSwitchSensorPart: FormPart;

  sensorData: {property: string, value: any}[];



  workflowModes = workflowModes;
  selectedSensor: string;

  workflowSubscription: Subscription;

  sensorChanges: Subject<{property: string, value: any}> = new Subject<{property: string, value: any}>();
  sensorChangesSubscription: Subscription;

  constructor(private store: Store<AppState>) {
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.mode = state.workflowAction.mode;

      this.sensorDynamicParts = state.workflowFormParts.dynamicParts.sensorDynamicParts;
      this.dynamicSwitchSensorPart = state.workflowFormParts.dynamicSwitchSensorPart;
      this.sensorData = state.workflowAction.workflowData.sensor;

      let selected = this.sensorData.find(xxx => xxx.property == this.dynamicSwitchSensorPart.property);
      this.selectedSensor = !!selected ? selected.value : undefined;
    });
  }

  ngOnInit(): void {
    this.sensorChangesSubscription = this.sensorChanges.pipe(
      // distinctUntilChanged()
    ).subscribe(sensorChange => {
      if(sensorChange.property == this.dynamicSwitchSensorPart.property){
        // this.selectedSensor = sensorChange.value;
        this.store.dispatch(new WorkflowSensorCleaned({property: sensorChange.property, value: sensorChange.value}));
      } else {
        this.store.dispatch(new WorkflowSensorChanged({property: sensorChange.property, value: sensorChange.value}));
      }
    });

  }

  ngAfterViewInit(): void {

  }

  getSensorTypes(): string[] {
    return this.sensorDynamicParts.map(component => component.name)
  }

  getSelectedSensorComponent(): FormPart[] {
    let sensorComponent = this.sensorDynamicParts.find(sc => sc.name == this.selectedSensor);
    return sensorComponent ? sensorComponent.parts : this.sensorDynamicParts[0].parts;
  }

  getValue(prop: string) {
    let val = this.sensorData.find(xxx => {
      return xxx.property == prop;
    });
    return !!val ? val.value : undefined;
  }

}
