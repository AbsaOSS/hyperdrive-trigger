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
import { KafkaSensorProperties } from '../../../../../../models/sensorProperties.model';

@Component({
  selector: 'app-kafka',
  templateUrl: './kafka.component.html',
  styleUrls: ['./kafka.component.scss'],
})
export class KafkaComponent {
  @Input() isShow: boolean;
  @Input() sensorProperties: KafkaSensorProperties;
  @Output() sensorPropertiesChange = new EventEmitter();

  constructor() {
    // do nothing
  }

  topicChange(topic: string) {
    this.sensorProperties = { ...this.sensorProperties, topic: topic };
    this.sensorPropertiesChange.emit(this.sensorProperties);
  }

  kafkaServersChange(servers: string[]) {
    this.sensorProperties = { ...this.sensorProperties, servers: servers };
    this.sensorPropertiesChange.emit(this.sensorProperties);
  }

  matchPropertiesChange(matchProperties: Map<string, string>) {
    this.sensorProperties = { ...this.sensorProperties, matchProperties: matchProperties };
    this.sensorPropertiesChange.emit(this.sensorProperties);
  }
}
