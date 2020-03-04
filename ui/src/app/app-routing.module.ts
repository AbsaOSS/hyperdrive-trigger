import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {LoginComponent} from "./components/login/login.component";
import {WorkflowsComponent} from "./components/workflows/workflows.component";
import {RunsComponent} from "./components/runs/runs.component";
import {AuthGuardService} from "./services/guards/authGuard.service";
import {LogInGuardService} from "./services/guards/logInGuard.service";
import {routeNames} from './app.constants';


const routes: Routes = [
  {path: routeNames.DEFAULT, redirectTo: routeNames.HOME, pathMatch: 'full', canActivate: [AuthGuardService]},
  {path: routeNames.LOGIN, component: LoginComponent, canActivate: [LogInGuardService]},
  {path: routeNames.HOME, component: HomeComponent, canActivate: [AuthGuardService]},
  {path: routeNames.WORKFLOWS, component: WorkflowsComponent, canActivate: [AuthGuardService]},
  {path: routeNames.RUNS, component: RunsComponent, canActivate: [AuthGuardService]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
