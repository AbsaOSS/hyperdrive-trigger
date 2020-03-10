import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from "./components/login/login.component";
import { WorkflowsComponent } from './components/workflows/workflows.component';
import { RunsComponent } from './components/runs/runs.component';

import { AppRoutingModule } from './app-routing.module';
import { ClarityModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { reducers } from "./stores/app.reducers";
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import {AuthService} from "./services/auth/auth.service";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {AuthEffects} from "./stores/auth/auth.effects";
import {CsrfInterceptor} from "./services/interceptors/csrf.interceptor";
import {UnauthorizedInterceptor} from "./services/interceptors/unauthorized.interceptor";
import {AuthGuardService} from "./services/guards/authGuard.service";
import {LogInGuardService} from "./services/guards/logInGuard.service";
import {DagRunDetailComponent} from "./components/runs/run-detail/run-detail.component";
import {RunsEffects} from "./stores/runs/runs.effects";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    WorkflowsComponent,
    RunsComponent,
    DagRunDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ClarityModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([AuthEffects, RunsEffects]),
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
export class AppModule { }
