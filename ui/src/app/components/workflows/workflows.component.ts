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
import { ProjectModel } from '../../models/project.model';
import { Store } from '@ngrx/store';
import { AppState, selectWorkflowState } from '../../stores/app.reducers';
import { Subscription } from 'rxjs';
import { InitializeWorkflows } from '../../stores/workflows/workflows.actions';
import { absoluteRoutes } from '../../constants/routes.constants';

@Component({
  selector: 'app-workflows',
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.scss'],
})
export class WorkflowsComponent implements AfterViewInit, OnDestroy {
  workflowsSubscription: Subscription = null;

  loading = true;
  projects: ProjectModel[] = [];

  absoluteRoutes = absoluteRoutes;

  constructor(private store: Store<AppState>) {
    this.store.dispatch(new InitializeWorkflows());
  }

  ngAfterViewInit(): void {
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.loading = state.loading;
      this.projects = state.projects;
      // this.projects = [...state.projects].sort((projectLeft, projectRight) => projectLeft.name.localeCompare(projectRight.name));
      // this.projects = [...this.projects].map((project: ProjectModel) => {
      //   const workflowsSorted = [...project.workflows].sort((workflowLeft, workflowRight) =>
      //     workflowLeft.name.localeCompare(workflowRight.name),
      //   );
      //   return { ...project, workflows: workflowsSorted };
      // });
    });
  }

  ngOnDestroy(): void {
    !!this.workflowsSubscription && this.workflowsSubscription.unsubscribe();
  }
}
