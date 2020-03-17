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

import {Injectable} from "@angular/core";
import {Actions, Effect, ofType} from "@ngrx/effects";
import * as WorkflowActions from "../workflows/workflows.actions";

import {catchError, mergeMap, switchMap} from "rxjs/operators";
import {WorkflowService} from "../../services/workflow/workflow.service";
import {ProjectModel} from "../../models/project.model";

@Injectable()
export class WorkflowsEffects {
  constructor(private actions: Actions, private workflowService: WorkflowService) {}

  @Effect({dispatch: true})
  workflowsInitialize = this.actions.pipe(
    ofType(WorkflowActions.INITIALIZE_WORKFLOWS),
    switchMap((action: WorkflowActions.InitializeWorkflows) => {
      return this.workflowService.getProjects().pipe(
        mergeMap((projects: ProjectModel[]) => {
          return [{
            type: WorkflowActions.INITIALIZE_WORKFLOWS_SUCCESS,
            payload: {projects: projects, workflows: [].concat(projects.map((project) => project.workflows))}
          }];
        }),
        catchError(() => {
          return [{
            type: WorkflowActions.INITIALIZE_WORKFLOWS_FAILURE
          }];
        })
      )})
  );

}
