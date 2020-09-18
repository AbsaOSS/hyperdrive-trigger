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

import { StatusModel } from '../status.model';

export const dagInstanceStatuses = {
  IN_QUEUE: new StatusModel('InQueue', 'darkmagenta', 'clock'),
  RUNNING: new StatusModel('Running', 'blue', 'play'),
  SUCCEEDED: new StatusModel('Succeeded', 'green', 'success-standard'),
  FAILED: new StatusModel('Failed', 'red', 'error-standard'),
  SKIPPED: new StatusModel('Skipped', 'grey', 'fast-forward'),

  getStatuses(): StatusModel[] {
    return [this.IN_QUEUE, this.RUNNING, this.SUCCEEDED, this.FAILED, this.SKIPPED];
  },
};
