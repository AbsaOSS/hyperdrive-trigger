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

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { WorkflowsComponent } from './components/workflows/workflows.component';
import { RunsComponent } from './components/runs/runs.component';
import { AuthGuardService } from './services/guards/authGuard.service';
import { LogInGuardService } from './services/guards/logInGuard.service';
import { routeNames } from './constants/routes.constants';
import { WorkflowsHomeComponent } from './components/workflows/workflows-home/workflows-home.component';
import { WorkflowComponent } from './components/workflows/workflow/workflow.component';
import { WorkflowHistoryComponent } from './components/workflows/workflow-history/workflow-history.component';
import { WorkflowComparisonComponent } from './components/workflows/workflow-history/workflow-comparison/workflow-comparison.component';

const routes: Routes = [
  { path: routeNames.DEFAULT, redirectTo: routeNames.WORKFLOWS, pathMatch: 'full', canActivate: [AuthGuardService] },
  { path: routeNames.LOGIN, component: LoginComponent, canActivate: [LogInGuardService] },
  {
    path: routeNames.WORKFLOWS,
    component: WorkflowsComponent,
    canActivate: [AuthGuardService],
    children: [
      { path: routeNames.WORKFLOWS_HOME, component: WorkflowsHomeComponent, pathMatch: 'full' },
      { path: routeNames.WORKFLOW_ACTION, component: WorkflowComponent },
      { path: routeNames.WORKFLOW_ACTION_WITH_ID, component: WorkflowComponent },
      { path: routeNames.WORKFLOW_HISTORY, component: WorkflowHistoryComponent },
    ],
  },
  { path: routeNames.WORKFLOW_HISTORY_COMPARISON, component: WorkflowComparisonComponent, canActivate: [AuthGuardService] },
  { path: routeNames.RUNS, component: RunsComponent, canActivate: [AuthGuardService] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
