import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {LoginComponent} from "./components/login/login.component";
import {WorkflowsComponent} from "./components/workflows/workflows.component";
import {RunsComponent} from "./components/runs/runs.component";
import {AuthGuardService} from "./services/guards/authGuard.service";
import {LogInGuardService} from "./services/guards/logInGuard.service";


const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full', canActivate: [AuthGuardService]},
  {path: 'login', component: LoginComponent, canActivate: [LogInGuardService]},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuardService]},
  {path: 'workflows', component: WorkflowsComponent, canActivate: [AuthGuardService]},
  {path: 'runs', component: RunsComponent, canActivate: [AuthGuardService]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
