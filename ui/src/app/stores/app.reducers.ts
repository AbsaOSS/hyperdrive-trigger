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

import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';
import * as fromApplication from './application/application.reducers';
import * as fromAuth from './auth/auth.reducers';
import * as fromRuns from './runs/runs.reducers';
import * as fromWorkflows from './workflows/workflows.reducers';
import * as fromJobTemplates from './job-templates/job-templates.reducers';
import * as fromNotificationRules from './notification-rules/notification-rules.reducers';
import { applicationReducer } from './application/application.reducers';
import { authReducer } from './auth/auth.reducers';
import { runsReducer } from './runs/runs.reducers';
import { workflowsReducer } from './workflows/workflows.reducers';
import { jobTemplatesReducer } from './job-templates/job-templates.reducers';
import { notificationRulesReducer } from './notification-rules/notification-rules.reducers';

export const applicationKey = 'application';
export const authKey = 'auth';
export const runsKey = 'runs';
export const workflowsKey = 'workflows';
export const jobTemplatesKey = 'jobTemplates';
export const notificationRulesKey = 'notificationRules';

export interface AppState {
  [applicationKey]: fromApplication.State;
  [authKey]: fromAuth.State;
  [runsKey]: fromRuns.State;
  [workflowsKey]: fromWorkflows.State;
  [jobTemplatesKey]: fromJobTemplates.State;
  [notificationRulesKey]: fromNotificationRules.State;
}

export const reducers: ActionReducerMap<AppState> = {
  [applicationKey]: applicationReducer,
  [authKey]: authReducer,
  [runsKey]: runsReducer,
  [workflowsKey]: workflowsReducer,
  [jobTemplatesKey]: jobTemplatesReducer,
  [notificationRulesKey]: notificationRulesReducer,
};

export const selectApplicationState = createFeatureSelector<AppState, fromApplication.State>(applicationKey);
export const selectAuthState = createFeatureSelector<AppState, fromAuth.State>(authKey);
export const selectRunState = createFeatureSelector<AppState, fromRuns.State>(runsKey);
export const selectWorkflowState = createFeatureSelector<AppState, fromWorkflows.State>(workflowsKey);
export const selectJobTemplatesState = createFeatureSelector<AppState, fromJobTemplates.State>(jobTemplatesKey);
export const selectNotificationRulesState = createFeatureSelector<AppState, fromNotificationRules.State>(notificationRulesKey);
