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

import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { ProjectModel, WorkflowIdentityModel } from '../../models/project.model';
import { Store } from '@ngrx/store';
import { AppState, selectWorkflowState } from '../../stores/app.reducers';
import { Subscription } from 'rxjs';
import { InitializeWorkflows } from '../../stores/workflows/workflows.actions';
import { absoluteRoutes } from '../../constants/routes.constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workflows',
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.scss'],
})
export class WorkflowsComponent implements AfterViewInit, OnDestroy {
  workflowsSubscription: Subscription = null;

  loading = true;
  projects: ProjectModel[] = [];
  openedProjects: Set<string> = new Set<string>();

  absoluteRoutes = absoluteRoutes;

  constructor(private store: Store<AppState>, private router: Router) {
    this.store.dispatch(new InitializeWorkflows());
  }

  ngAfterViewInit(): void {
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.loading = state.loading;
      this.projects = state.projects;
    });
  }

  isWorkflowHighlighted(id: number): boolean {
    return this.router.url.split('/').some((part) => part === id.toString());
  }

  isProjectClosed(project: string, workflows: WorkflowIdentityModel[]): boolean {
    const isOpen =
      this.openedProjects.has(project) || workflows.some((workflow: WorkflowIdentityModel) => this.isWorkflowHighlighted(workflow.id));
    if (isOpen && !this.openedProjects.has(project)) {
      this.openedProjects.add(project);
    }
    return !isOpen;
  }

  openCloseProject(project: string) {
    if (this.openedProjects.has(project)) {
      this.openedProjects.delete(project);
    } else {
      this.openedProjects.add(project);
    }
  }

  ngOnDestroy(): void {
    !!this.workflowsSubscription && this.workflowsSubscription.unsubscribe();
  }
}
