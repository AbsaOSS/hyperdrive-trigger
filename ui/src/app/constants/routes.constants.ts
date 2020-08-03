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

import { workflowModes } from '../models/enums/workflowModes.constants';

export const routeNames = {
  DEFAULT: '',
  LOGIN: 'login',
  WORKFLOWS: 'workflows',
  WORKFLOWS_HOME: '',
  WORKFLOW_ACTION: ':mode',
  WORKFLOW_ACTION_WITH_ID: ':mode/:id',
  WORKFLOW_HISTORY: 'show/:id/history',
  WORKFLOW_HISTORY_COMPARISON: 'workflows/show/:id/history/:historyIdLeft/compareWith/:historyIdRight',
  RUNS: 'runs',
  RUNS_WITH_WORKFLOW_ID: 'runs/:workflowId',
};

export const absoluteRoutes = {
  DEFAULT: `/${routeNames.DEFAULT}`,
  LOGIN: `/${routeNames.LOGIN}`,
  WORKFLOWS: `/${routeNames.WORKFLOWS}`,
  WORKFLOWS_HOME: `/${routeNames.WORKFLOWS}`,
  SHOW_WORKFLOW: `/${routeNames.WORKFLOWS}/${workflowModes.SHOW}`,
  CREATE_WORKFLOW: `/${routeNames.WORKFLOWS}/${workflowModes.CREATE}`,
  EDIT_WORKFLOW: `/${routeNames.WORKFLOWS}/${workflowModes.EDIT}`,
  COPY_WORKFLOW: `/${routeNames.WORKFLOWS}/${workflowModes.COPY}`,
  RUNS: `/${routeNames.RUNS}`,
  RUNS_WITH_WORKFLOW_ID(workflowId: number): string {
    return `/runs/${workflowId}`;
  },
  WORKFLOW_HISTORY(id: number): string {
    return `/${routeNames.WORKFLOWS}/${workflowModes.SHOW}/${id}/history`;
  },
  WORKFLOW_HISTORY_COMPARISON(workflowId: number, historyIdFirst: number, historyIdSecond: number): string {
    return `/${routeNames.WORKFLOWS}/${workflowModes.SHOW}/${workflowId}/history/${historyIdFirst}/compareWith/${historyIdSecond}`;
  },
};
