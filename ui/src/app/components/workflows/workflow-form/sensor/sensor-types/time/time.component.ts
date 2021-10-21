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
import { TimeSensorProperties } from '../../../../../../models/sensorProperties.model';

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.scss'],
})
export class TimeComponent {
  @Input() isShow: boolean;
  @Input() sensorProperties: TimeSensorProperties;
  @Output() sensorPropertiesChange = new EventEmitter();

  constructor() {
    // do nothing
  }

  runAtChange(cronExpression: string) {
    this.sensorProperties = { ...this.sensorProperties, cronExpression: cronExpression };
    this.sensorPropertiesChange.emit(this.sensorProperties);
  }
}
