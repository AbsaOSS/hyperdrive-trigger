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

import { UuidUtil } from '../utils/uuid/uuid.util';
import { sensorTypes } from '../constants/sensorTypes.constants';
import { defaultCronExpression } from '../constants/cronExpression.constants';

export interface SensorProperties {
  sensorType: string;
}

export class KafkaSensorProperties implements SensorProperties {
  sensorType: string;
  topic: string;
  servers: string[];
  matchProperties: Map<string, string>;

  static createEmpty(): KafkaSensorProperties {
    return { sensorType: sensorTypes.KAFKA, topic: '', servers: [''], matchProperties: new Map() };
  }
}

export class AbsaKafkaSensorProperties implements SensorProperties {
  sensorType: string;
  topic: string;
  servers: string[];
  ingestionToken: string;

  static createEmpty(): AbsaKafkaSensorProperties {
    return { sensorType: sensorTypes.ABSA_KAFKA, topic: '', servers: [''], ingestionToken: UuidUtil.createUUID() };
  }
}

export class TimeSensorProperties implements SensorProperties {
  sensorType: string;
  cronExpression: string;

  static createEmpty(): TimeSensorProperties {
    return { sensorType: sensorTypes.TIME, cronExpression: defaultCronExpression };
  }
}

export class RecurringSensorProperties implements SensorProperties {
  sensorType: string;

  static createEmpty(): RecurringSensorProperties {
    return { sensorType: sensorTypes.RECURRING };
  }
}
