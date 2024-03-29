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
import { AbsaKafkaSensorProperties } from '../../../../../../models/sensorProperties.model';

@Component({
  selector: 'app-absa-kafka',
  templateUrl: './absa-kafka.component.html',
  styleUrls: ['./absa-kafka.component.scss'],
})
export class AbsaKafkaComponent {
  @Input() isShow: boolean;
  @Input() sensorProperties: AbsaKafkaSensorProperties;
  @Output() sensorPropertiesChange: EventEmitter<AbsaKafkaSensorProperties> = new EventEmitter();

  constructor() {
    // do nothing
  }

  topicChange(topic: string) {
    this.sensorPropertiesChange.emit({ ...this.sensorProperties, topic: topic });
  }

  kafkaServersChange(kafkaServers: string[]) {
    this.sensorPropertiesChange.emit({ ...this.sensorProperties, servers: kafkaServers });
  }

  ingestionTokenChange(ingestionToken: string) {
    this.sensorPropertiesChange.emit({ ...this.sensorProperties, ingestionToken: ingestionToken });
  }
}
