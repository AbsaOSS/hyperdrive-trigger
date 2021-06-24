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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/auth/login/login.component';
import { WorkflowsComponent } from './components/workflows/workflows.component';
import { RunsComponent } from './components/runs/runs.component';

import { AppRoutingModule } from './app-routing.module';
import { ClarityModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { reducers } from './stores/app.reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { AuthService } from './services/auth/auth.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthEffects } from './stores/auth/auth.effects';
import { ApplicationEffects } from './stores/application/application.effects';
import { CsrfInterceptor } from './services/interceptors/csrf.interceptor';
import { UnauthorizedInterceptor } from './services/interceptors/unauthorized.interceptor';
import { AuthGuardService } from './services/guards/authGuard.service';
import { LogInGuardService } from './services/guards/logInGuard.service';
import { RunDetailComponent } from './components/runs/run-detail/run-detail.component';
import { RunsEffects } from './stores/runs/runs.effects';
import { WorkflowsEffects } from './stores/workflows/workflows.effects';
import { WorkflowsHomeComponent } from './components/workflows/workflows-home/workflows-home.component';
import { StringFilterComponent } from './components/common/datagrid/filters/string-filter/string-filter.component';
import { DatetimeRangeFilterComponent } from './components/common/datagrid/filters/datetime-range-filter/datetime-range-filter.component';
import { MultipleStatusFilterComponent } from './components/common/datagrid/filters/multiple-status-filter/multiple-status-filter.component';
import { NumberRangeFilterComponent } from './components/common/datagrid/filters/number-range-filter/number-range-filter.component';
import { WorkflowComponent } from './components/workflows/workflow/workflow.component';
import { WorkflowDetailsComponent } from './components/workflows/workflow-form/workflow-details/workflow-details.component';
import { SensorComponent } from './components/workflows/workflow-form/sensor/sensor.component';
import { JobsComponent } from './components/workflows/workflow-form/jobs/jobs.component';
import { StringPartComponent } from './components/workflows/workflow-form/dynamic-parts/string-part/string-part.component';
import { BooleanPartComponent } from './components/workflows/workflow-form/dynamic-parts/boolean-part/boolean-part.component';
import { SelectPartComponent } from './components/workflows/workflow-form/dynamic-parts/select-part/select-part.component';
import { StringSequencePartComponent } from './components/workflows/workflow-form/dynamic-parts/string-sequence-part/string-sequence-part.component';
import { KeyStringValuePartComponent } from './components/workflows/workflow-form/dynamic-parts/key-string-value-part/key-string-value-part.component';
import { GuidPartComponent } from './components/workflows/workflow-form/dynamic-parts/guid-part/guid-part.component';
import { CronQuartzPartComponent } from './components/workflows/workflow-form/dynamic-parts/cron-quartz-part/cron-quartz-part.component';
import { JobComponent } from './components/workflows/workflow-form/jobs/job/job.component';
import { DynamicPartsComponent } from './components/workflows/workflow-form/dynamic-parts/dynamic-parts.component';
import { PreviousRouteService } from './services/previousRoute/previous-route.service';
import { ToastrModule } from 'ngx-toastr';
import { ConfirmationDialogComponent } from './components/common/confirmation-dialog/confirmation-dialog.component';
import { CronQuartzExpressionValidator } from './components/workflows/workflow-form/dynamic-parts/cron-quartz-part/validator/cron-quartz-expression.validator';
import { WorkflowHistoryComponent } from './components/workflows/workflow-history/workflow-history.component';
import { WorkflowComparisonComponent } from './components/workflows/workflow-history/workflow-comparison/workflow-comparison.component';
import { WorkflowFormComponent } from './components/workflows/workflow-form/workflow-form.component';
import { HistoryDetailComponent } from './components/workflows/workflow-history/workflow-comparison/history-detail/history-detail.component';
import { WorkflowRunComponent } from './components/workflows/workflow-run/workflow-run.component';
import { BooleanFilterComponent } from './components/common/datagrid/filters/boolean-filter/boolean-filter.component';
import { WelcomeComponent } from './components/auth/welcome/welcome.component';
import { LoginDialogComponent } from './components/auth/login-dialog/login-dialog.component';
import { BaseUrlInterceptor } from './services/interceptors/baseurl.interceptor';
import { JobTemplatesComponent } from './components/admin/job-templates/job-templates.component';
import { JobTemplatesEffects } from './stores/job-templates/job-templates.effects';
import { JobTemplatesHomeComponent } from './components/admin/job-templates/job-templates-home/job-templates-home.component';
import { JobTemplateShowComponent } from './components/admin/job-templates/job-template-show/job-template-show.component';
import { StringWithSuggestionsPartComponent } from './components/workflows/workflow-form/dynamic-parts/string-with-suggestions-part/string-with-suggestions-part.component';
import { NotificationRulesComponent } from './components/admin/notification-rules/notification-rules.component';
import { NotificationRulesHomeComponent } from './components/admin/notification-rules/notification-rules-home/notification-rules-home.component';
import { NotificationRulesFormComponent } from './components/admin/notification-rules/notification-rules-form/notification-rules-form.component';
import { NotificationRulesEffects } from './stores/notification-rules/notification-rules.effects';
import { ComboboxPartComponent } from './components/workflows/workflow-form/dynamic-parts/combobox-part/combobox-part.component';
import { DurationPartComponent } from './components/workflows/workflow-form/dynamic-parts/duration-part/duration-part.component';
import { NotificationRuleComponent } from './components/admin/notification-rules/notification-rule/notification-rule.component';
import { NotificationRuleComparisonComponent } from './components/admin/notification-rules/notification-rule-history/notification-rule-comparison/notification-rule-comparison.component';
import { NotificationRuleHistoryComponent } from './components/admin/notification-rules/notification-rule-history/notification-rule-history.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    WorkflowsComponent,
    RunsComponent,
    RunDetailComponent,
    WorkflowsHomeComponent,
    StringFilterComponent,
    DatetimeRangeFilterComponent,
    MultipleStatusFilterComponent,
    NumberRangeFilterComponent,
    WorkflowComponent,
    WorkflowDetailsComponent,
    SensorComponent,
    JobsComponent,
    JobComponent,
    StringPartComponent,
    StringWithSuggestionsPartComponent,
    BooleanPartComponent,
    ComboboxPartComponent,
    DurationPartComponent,
    SelectPartComponent,
    StringSequencePartComponent,
    KeyStringValuePartComponent,
    GuidPartComponent,
    CronQuartzPartComponent,
    DynamicPartsComponent,
    ConfirmationDialogComponent,
    CronQuartzExpressionValidator,
    WorkflowHistoryComponent,
    WorkflowComparisonComponent,
    WorkflowFormComponent,
    HistoryDetailComponent,
    WorkflowRunComponent,
    BooleanFilterComponent,
    WelcomeComponent,
    LoginDialogComponent,
    JobTemplatesComponent,
    JobTemplatesHomeComponent,
    JobTemplateShowComponent,
    NotificationRuleComponent,
    NotificationRulesComponent,
    NotificationRulesHomeComponent,
    NotificationRulesFormComponent,
    NotificationRuleComparisonComponent,
    NotificationRuleHistoryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ClarityModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ToastrModule.forRoot({
      timeOut: 5000,
    }),
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([ApplicationEffects, AuthEffects, RunsEffects, WorkflowsEffects, JobTemplatesEffects, NotificationRulesEffects]),
    StoreRouterConnectingModule.forRoot(),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
  ],
  providers: [
    AuthService,
    AuthGuardService,
    LogInGuardService,
    PreviousRouteService,
    { provide: HTTP_INTERCEPTORS, useClass: CsrfInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: BaseUrlInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: UnauthorizedInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
