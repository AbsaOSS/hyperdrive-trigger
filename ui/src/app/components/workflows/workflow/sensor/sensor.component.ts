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

import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {WorkflowJoinedModel} from "../../../../models/workflowJoined.model";
import {workflowModes} from "../../../../models/enums/workflowModes.constants";
import {Subject, Subscription} from "rxjs";
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import {ComponentModel} from "../../../../models/workflowComponents.model";
import {distinctUntilChanged} from "rxjs/operators";

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.scss']
})
export class SensorComponent implements OnInit, AfterViewInit {
  @Input() workflowUpdates: Subject<WorkflowJoinedModel>;
  @Input() mode: string;
  @Input() workflow: WorkflowJoinedModel;
  @Input() sensorComponents: ComponentModel[];

  workflowModes = workflowModes;

  sensorChanges: Subject<{property: string, value: any}> = new Subject<{property: string, value: any}>();
  sensorChangesSubscription: Subscription;

  constructor() { }

  ngOnInit(): void {
    this.sensorChangesSubscription = this.sensorChanges.pipe(
      distinctUntilChanged()
    ).subscribe(sensorChange => {
      console.log('changing start');
      console.log(sensorChange.property);
      console.log(sensorChange.value);
      let copiedWorkflow: WorkflowJoinedModel = cloneDeep(this.workflow);
      let copiedValue = cloneDeep(sensorChange.value);
      set(copiedWorkflow.sensor, sensorChange.property, copiedValue);
      console.log(copiedWorkflow);
      console.log('changing end');
      this.workflowUpdates.next(copiedWorkflow);
    });
  }

  ngAfterViewInit(): void {

  }

  getSensorTypes(): string[] {
    return this.sensorComponents.map(component => component.name)
  }

  getSelectedSensorComponent(): ComponentModel {
    let sensorComponent = this.sensorComponents.find(sc => sc.name == this.workflow.sensor.sensorType.name);
    return sensorComponent ? sensorComponent : this.sensorComponents[0];
  }

}
