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
import { WorkflowsComponent } from './components/workflows/workflows.component';
import { RunsComponent } from './components/runs/runs.component';
import { AuthGuardService } from './services/guards/authGuard.service';
import { LogInGuardService } from './services/guards/logInGuard.service';
import { routeNames } from './constants/routes.constants';
import { WorkflowsHomeComponent } from './components/workflows/workflows-home/workflows-home.component';
import { WorkflowComponent } from './components/workflows/workflow/workflow.component';
import { WorkflowHistoryComponent } from './components/workflows/workflow-history/workflow-history.component';
import { WorkflowComparisonComponent } from './components/workflows/workflow-history/workflow-comparison/workflow-comparison.component';
import { WelcomeComponent } from './components/auth/welcome/welcome.component';
import { JobTemplatesComponent } from './components/admin/job-templates/job-templates.component';
import { JobTemplatesHomeComponent } from './components/admin/job-templates/job-templates-home/job-templates-home.component';
import { JobTemplateShowComponent } from './components/admin/job-templates/job-template-show/job-template-show.component';
import { NotificationRulesComponent } from './components/admin/notification-rules/notification-rules.component';
import { NotificationRulesHomeComponent } from './components/admin/notification-rules/notification-rules-home/notification-rules-home.component';
import { NotificationRuleComponent } from './components/admin/notification-rules/notification-rule/notification-rule.component';
import { NotificationRuleHistoryComponent } from './components/admin/notification-rules/notification-rule-history/notification-rule-history.component';
import { NotificationRuleComparisonComponent } from './components/admin/notification-rules/notification-rule-history/notification-rule-comparison/notification-rule-comparison.component';

const routes: Routes = [
  { path: routeNames.DEFAULT, redirectTo: routeNames.WORKFLOWS, pathMatch: 'full' },
  { path: routeNames.WELCOME, component: WelcomeComponent, canActivate: [LogInGuardService] },
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
  { path: routeNames.RUNS_WITH_WORKFLOW_ID, component: RunsComponent, canActivate: [AuthGuardService] },
  {
    path: routeNames.JOB_TEMPLATES,
    component: JobTemplatesComponent,
    canActivate: [AuthGuardService],
    children: [
      { path: routeNames.JOB_TEMPLATES_HOME, component: JobTemplatesHomeComponent, pathMatch: 'full' },
      { path: routeNames.JOB_TEMPLATE_SHOW, component: JobTemplateShowComponent },
    ],
  },
  {
    path: routeNames.NOTIFICATION_RULES,
    component: NotificationRulesComponent,
    canActivate: [AuthGuardService],
    children: [
      { path: routeNames.NOTIFICATION_RULES_HOME, component: NotificationRulesHomeComponent, pathMatch: 'full' },
      { path: routeNames.NOTIFICATION_RULE_ACTION, component: NotificationRuleComponent },
      { path: routeNames.NOTIFICATION_RULE_ACTION_WITH_ID, component: NotificationRuleComponent },
      { path: routeNames.NOTIFICATION_RULE_HISTORY, component: NotificationRuleHistoryComponent },
    ],
  },
  {
    path: routeNames.NOTIFICATION_RULE_HISTORY_COMPARISON,
    component: NotificationRuleComparisonComponent,
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
