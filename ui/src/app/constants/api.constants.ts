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

export const api = {
  USER_INFO: '/user/info',
  LOGIN: '/login',
  LOGOUT: '/logout',

  DAG_RUN_SEARCH: '/dagRuns/search',
  JOB_INSTANCES: '/jobInstances',

  GET_PROJECTS: '/workflows/projects',
  GET_WORKFLOW: '/workflow',
  DELETE_WORKFLOW: '/workflows',
  SWITCH_WORKFLOW_ACTIVE_STATE: '/workflows/{id}/switchActiveState',
  RUN_WORKFLOW: '/workflow/run',
  CREATE_WORKFLOW: '/workflow',
  UPDATE_WORKFLOW: '/workflows',
  GET_HISTORY_FOR_WORKFLOW: '/workflowHistory',
  GET_WORKFLOWS_FROM_HISTORY: '/workflowsFromHistory',
  GET_QUARTZ_DETAIL: '/util/quartzDetail',
};
