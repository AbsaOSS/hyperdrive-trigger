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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { sensorTypes, sensorTypesArray } from '../../../../constants/sensorTypes.constants';
import {
  AbsaKafkaSensorProperties,
  KafkaSensorProperties,
  RecurringSensorProperties,
  SensorProperties,
  TimeSensorProperties,
} from '../../../../models/sensorProperties.model';
import { SensorModel } from '../../../../models/sensor.model';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.scss'],
})
export class SensorComponent {
  @Input() isShow: boolean;
  @Input() sensor: SensorModel;
  @Output() sensorChange = new EventEmitter();

  sensorTypesArray = sensorTypesArray;
  sensorTypes = sensorTypes;

  constructor() {
    // do nothing
  }

  sensorTypeChange(sensorType: string) {
    switch (sensorType) {
      case sensorTypes.ABSA_KAFKA: {
        this.sensor = { ...this.sensor, properties: AbsaKafkaSensorProperties.createEmpty() };
        break;
      }
      case sensorTypes.KAFKA: {
        this.sensor = { ...this.sensor, properties: KafkaSensorProperties.createEmpty() };
        break;
      }
      case sensorTypes.TIME: {
        this.sensor = { ...this.sensor, properties: TimeSensorProperties.createEmpty() };
        break;
      }
      case sensorTypes.RECURRING: {
        this.sensor = { ...this.sensor, properties: RecurringSensorProperties.createEmpty() };
        break;
      }
    }
    this.sensorChange.emit(this.sensor);
  }

  sensorPropertiesChange(sensorProperties: SensorProperties) {
    this.sensor = { ...this.sensor, properties: sensorProperties };
    this.sensorChange.emit(this.sensor);
  }
}
