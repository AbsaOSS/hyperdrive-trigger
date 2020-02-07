/*
 * Copyright 2018-2019 ABSA Group Limited
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
import { ErrorHandler, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AlertComponent } from './components/alert/alert.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CsrfInterceptor } from './services/csrf.interceptor';
import { GlobalErrorHandler } from './services/global.error.handler';
import { ErrorComponent } from './components/error/error.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { DemoComponent } from './components/demo/demo.component';

@NgModule({
    declarations: [AppComponent, AlertComponent, HomeComponent, LoginComponent, ErrorComponent, PageNotFoundComponent, DemoComponent],
    imports: [BrowserModule, ReactiveFormsModule, HttpClientModule, AppRoutingModule],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: CsrfInterceptor, multi: true },
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
