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

import { WorkflowJoinedModel } from './workflowJoined.model';

export type HistoryModel = {
  id: number;
  changedOn: Date;
  changedBy: string;
  operation: OperationType;
};

export type OperationType = {
  name: string;
};

export class HistoryModelFactory {
  static create(id: number, changedOn: Date, changedBy: string, operation: OperationType): HistoryModel {
    return {
      id: id,
      changedOn: changedOn,
      changedBy: changedBy,
      operation: operation,
    };
  }
}

export type HistoryPairModel<T> = {
  leftHistory: T;
  rightHistory: T;
};

export type WorkflowHistoryModel = {
  history: HistoryModel;
  workflowId: number;
  workflow: WorkflowJoinedModel;
};

export class WorkflowHistoryModelFactory {
  static create(history: HistoryModel, workflowId: number, workflow: WorkflowJoinedModel): WorkflowHistoryModel {
    return {
      history: history,
      workflowId: workflowId,
      workflow: workflow,
    };
  }
}
