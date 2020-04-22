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

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HomeComponent} from './components/home/home.component';
import {LoginComponent} from "./components/login/login.component";
import {WorkflowsComponent} from './components/workflows/workflows.component';
import {RunsComponent} from './components/runs/runs.component';

import {AppRoutingModule} from './app-routing.module';
import {ClarityModule} from '@clr/angular';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {StoreRouterConnectingModule} from '@ngrx/router-store';
import {reducers} from "./stores/app.reducers";
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {environment} from '../environments/environment';
import {AuthService} from "./services/auth/auth.service";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {AuthEffects} from "./stores/auth/auth.effects";
import {CsrfInterceptor} from "./services/interceptors/csrf.interceptor";
import {UnauthorizedInterceptor} from "./services/interceptors/unauthorized.interceptor";
import {AuthGuardService} from "./services/guards/authGuard.service";
import {LogInGuardService} from "./services/guards/logInGuard.service";
import {RunDetailComponent} from "./components/runs/run-detail/run-detail.component";
import {RunsEffects} from "./stores/runs/runs.effects";
import {WorkflowsEffects} from "./stores/workflows/workflows.effects";
import {WorkflowsHomeComponent} from './components/workflows/workflows-home/workflows-home.component';
import {StringFilterComponent} from './components/runs/filters/string-filter/string-filter.component';
import {DatetimeRangeFilterComponent} from "./components/runs/filters/datetime-range-filter/datetime-range-filter.component";
import {StatusFilterComponent} from "./components/runs/filters/status-filter/status-filter.component";
import {NumberRangeFilterComponent} from "./components/runs/filters/number-range-filter/number-range-filter.component";
import {WorkflowComponent} from './components/workflows/workflow/workflow.component';
import {WorkflowDetailsComponent} from './components/workflows/workflow/workflow-details/workflow-details.component';
import {SensorComponent} from './components/workflows/workflow/sensor/sensor.component';
import {JobsComponent} from './components/workflows/workflow/jobs/jobs.component';
import {StringPartComponent} from './components/workflows/workflow/dynamic-parts/string-part/string-part.component';
import {BooleanPartComponent} from './components/workflows/workflow/dynamic-parts/boolean-part/boolean-part.component';
import {SelectPartComponent} from './components/workflows/workflow/dynamic-parts/select-part/select-part.component';
import {StringSequencePartComponent} from './components/workflows/workflow/dynamic-parts/string-sequence-part/string-sequence-part.component';
import {KeyStringValuePartComponent} from './components/workflows/workflow/dynamic-parts/key-string-value-part/key-string-value-part.component';
import {GuidFieldComponent} from './components/workflows/workflow/dynamic-parts/guid-field/guid-field.component';
import {CronQuartzFieldComponent} from './components/workflows/workflow/dynamic-parts/cron-quartz-field/cron-quartz-field.component';
import {JobComponent} from './components/workflows/workflow/jobs/job/job.component';
import {DynamicPartsComponent} from "./components/workflows/workflow/dynamic-parts/dynamic-parts.component";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    WorkflowsComponent,
    RunsComponent,
    RunDetailComponent,
    WorkflowsHomeComponent,
    StringFilterComponent,
    DatetimeRangeFilterComponent,
    StatusFilterComponent,
    NumberRangeFilterComponent,
    WorkflowComponent,
    WorkflowDetailsComponent,
    SensorComponent,
    JobsComponent,
    JobComponent,
    StringPartComponent,
    BooleanPartComponent,
    SelectPartComponent,
    StringSequencePartComponent,
    KeyStringValuePartComponent,
    GuidFieldComponent,
    CronQuartzFieldComponent,
    DynamicPartsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ClarityModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([AuthEffects, RunsEffects, WorkflowsEffects]),
    StoreRouterConnectingModule.forRoot(),
    !environment.production ? StoreDevtoolsModule.instrument() : []
  ],
  providers: [
    AuthService,
    AuthGuardService,
    LogInGuardService,
    {provide: HTTP_INTERCEPTORS, useClass: CsrfInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: UnauthorizedInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
