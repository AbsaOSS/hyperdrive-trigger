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

export type NotificationRuleModel = {
  isActive: boolean;
  project: string;
  workflowPrefix: string;
  minElapsedSecondsSinceLastSuccess: number;
  statuses: string[];
  recipients: string[];
  created: Date;
  updated: Date;
  id: number;
};

export class NotificationRuleModelFactory {
  static create(
    isActive: boolean,
    project: string,
    workflowPrefix: string,
    minElapsedSecondsSinceLastSuccess: number,
    statuses: string[],
    recipients: string[],
    created: Date,
    updated: Date,
    id: number,
  ): NotificationRuleModel {
    return {
      isActive: isActive,
      project: project,
      workflowPrefix: workflowPrefix,
      minElapsedSecondsSinceLastSuccess: minElapsedSecondsSinceLastSuccess,
      statuses: statuses,
      recipients: recipients,
      created: created,
      updated: updated,
      id: id,
    };
  }

  static createEmpty(): NotificationRuleModel {
    return {
      isActive: false,
      project: '',
      workflowPrefix: '',
      minElapsedSecondsSinceLastSuccess: undefined,
      statuses: [],
      recipients: [],
      created: undefined,
      updated: undefined,
      id: undefined,
    };
  }
}
