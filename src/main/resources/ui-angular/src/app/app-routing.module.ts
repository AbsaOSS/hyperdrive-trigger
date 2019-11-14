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

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from './services/auth.guard';
import {routeName} from './app.routes';
import {ErrorComponent} from './components/error/error.component';
import {PageNotFoundComponent} from './components/page-not-found/page-not-found.component';
import {DemoComponent} from './components/demo/demo.component';

const routes: Routes = [
  { path: routeName.DEFAULT, component: HomeComponent, canActivate: [AuthGuard] },
  { path: routeName.LOGIN, component: LoginComponent },
  { path: routeName.ERROR, component: ErrorComponent},
  { path: routeName.DEMO, component: DemoComponent, canActivate: [AuthGuard]},
  { path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}

