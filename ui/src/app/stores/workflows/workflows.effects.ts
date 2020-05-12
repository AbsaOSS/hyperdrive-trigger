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

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as WorkflowActions from '../workflows/workflows.actions';

import { catchError, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { WorkflowService } from '../../services/workflow/workflow.service';
import { ProjectModel } from '../../models/project.model';
import { WorkflowJoinedModel } from '../../models/workflowJoined.model';
import { workflowModes } from '../../models/enums/workflowModes.constants';
import { DynamicFormParts, WorkflowFormPartsModel } from '../../models/workflowFormParts.model';
import { workflowFormPartsSequences, workflowFormParts as workflowFormPartsConsts } from '../../constants/workflowFormParts.constants';
import { AppState, selectWorkflowState } from '../app.reducers';
import { Store } from '@ngrx/store';
import * as fromWorkflows from './workflows.reducers';
import { WorkflowDataModel } from '../../models/workflowData.model';
import { Router } from '@angular/router';
import { absoluteRoutes } from '../../constants/routes.constants';
import { ToastrService } from 'ngx-toastr';
import { texts } from '../../constants/texts.constants';

@Injectable()
export class WorkflowsEffects {
  constructor(
    private actions: Actions,
    private workflowService: WorkflowService,
    private store: Store<AppState>,
    private router: Router,
    private toastrService: ToastrService,
  ) {}

  @Effect({ dispatch: true })
  workflowsInitialize = this.actions.pipe(
    ofType(WorkflowActions.INITIALIZE_WORKFLOWS),
    switchMap((action: WorkflowActions.InitializeWorkflows) => {
      return this.workflowService.getProjects();
    }),
    mergeMap((projects: ProjectModel[]) => {
      return this.workflowService.getWorkflowDynamicFormParts().pipe(
        mergeMap((workflowComponents: DynamicFormParts) => {
          const workflowFormParts = new WorkflowFormPartsModel(
            workflowFormPartsSequences.allDetails,
            workflowFormPartsConsts.SENSOR.SENSOR_TYPE,
            workflowFormPartsConsts.JOB.JOB_NAME,
            workflowFormPartsConsts.JOB.JOB_TYPE,
            workflowComponents,
          );
          return [
            {
              type: WorkflowActions.INITIALIZE_WORKFLOWS_SUCCESS,
              payload: {
                projects: projects,
                workflowFormParts: workflowFormParts,
              },
            },
          ];
        }),
        catchError(() => {
          return [
            {
              type: WorkflowActions.INITIALIZE_WORKFLOWS_FAILURE,
            },
          ];
        }),
      );
    }),
  );

  @Effect({ dispatch: true })
  workflowInitializationStart = this.actions.pipe(
    ofType(WorkflowActions.START_WORKFLOW_INITIALIZATION),
    withLatestFrom(this.store.select(selectWorkflowState)),
    switchMap(([action, state]: [WorkflowActions.StartWorkflowInitialization, fromWorkflows.State]) => {
      if (action.payload.mode === workflowModes.CREATE) {
        return [
          {
            type: WorkflowActions.SET_EMPTY_WORKFLOW,
          },
        ];
      } else {
        if (!action.payload.id) {
          return [
            {
              type: WorkflowActions.LOAD_WORKFLOW_FAILURE_INCORRECT_ID,
            },
          ];
        } else {
          return this.workflowService.getWorkflow(action.payload.id).pipe(
            mergeMap((worfklow: WorkflowJoinedModel) => {
              const workflowData = new WorkflowDataModel(worfklow, state.workflowFormParts.dynamicParts);

              return [
                {
                  type: WorkflowActions.LOAD_WORKFLOW_SUCCESS,
                  payload: {
                    workflow: worfklow,
                    detailsData: workflowData.getDetailsData(),
                    sensorData: workflowData.getSensorData(),
                    jobsData: workflowData.getJobsData(),
                  },
                },
              ];
            }),
            catchError(() => {
              return [
                {
                  type: WorkflowActions.LOAD_WORKFLOW_FAILURE,
                },
              ];
            }),
          );
        }
      }
    }),
  );

  @Effect({ dispatch: true })
  workflowDelete = this.actions.pipe(
    ofType(WorkflowActions.DELETE_WORKFLOW),
    switchMap((action: WorkflowActions.DeleteWorkflow) => {
      return this.workflowService.deleteWorkflow(action.payload).pipe(
        mergeMap((result: boolean) => {
          if (result) {
            this.router.navigateByUrl(absoluteRoutes.WORKFLOWS_HOME);
            this.toastrService.success(texts.DELETE_WORKFLOW_SUCCESS_NOTIFICATION);
            return [
              {
                type: WorkflowActions.DELETE_WORKFLOW_SUCCESS,
                payload: action.payload,
              },
            ];
          } else {
            this.toastrService.error(texts.DELETE_WORKFLOW_FAILURE_NOTIFICATION);
            return [
              {
                type: WorkflowActions.DELETE_WORKFLOW_FAILURE,
              },
            ];
          }
        }),
        catchError(() => {
          this.toastrService.error(texts.DELETE_WORKFLOW_FAILURE_NOTIFICATION);
          return [
            {
              type: WorkflowActions.DELETE_WORKFLOW_FAILURE,
            },
          ];
        }),
      );
    }),
  );

  @Effect({ dispatch: true })
  workflowActiveStateSwitch = this.actions.pipe(
    ofType(WorkflowActions.SWITCH_WORKFLOW_ACTIVE_STATE),
    switchMap((action: WorkflowActions.SwitchWorkflowActiveState) => {
      return this.workflowService.switchWorkflowActiveState(action.payload.id).pipe(
        mergeMap((result: boolean) => {
          if (result) {
            this.toastrService.success(texts.SWITCH_WORKFLOW_ACTIVE_STATE_SUCCESS_NOTIFICATION(action.payload.currentActiveState));
            return [
              {
                type: WorkflowActions.SWITCH_WORKFLOW_ACTIVE_STATE_SUCCESS,
                payload: action.payload.id,
              },
            ];
          } else {
            this.toastrService.error(texts.SWITCH_WORKFLOW_ACTIVE_STATE_FAILURE_NOTIFICATION);
            return [
              {
                type: WorkflowActions.SWITCH_WORKFLOW_ACTIVE_STATE_FAILURE,
              },
            ];
          }
        }),
        catchError(() => {
          this.toastrService.error(texts.SWITCH_WORKFLOW_ACTIVE_STATE_FAILURE_NOTIFICATION);
          return [
            {
              type: WorkflowActions.SWITCH_WORKFLOW_ACTIVE_STATE_FAILURE,
            },
          ];
        }),
      );
    }),
  );

  @Effect({ dispatch: true })
  workflowRun = this.actions.pipe(
    ofType(WorkflowActions.RUN_WORKFLOW),
    switchMap((action: WorkflowActions.RunWorkflow) => {
      return this.workflowService.runWorkflow(action.payload);
    }),
    mergeMap((runWorkflowSuccess) => {
      if (runWorkflowSuccess) {
        this.toastrService.success(texts.RUN_WORKFLOW_SUCCESS_NOTIFICATION);
        return [{ type: WorkflowActions.RUN_WORKFLOW_SUCCESS }];
      } else {
        this.toastrService.error(texts.RUN_WORKFLOW_FAILURE_NOTIFICATION);
        return [{ type: WorkflowActions.RUN_WORKFLOW_FAILURE }];
      }
    }),
    catchError(() => {
      this.toastrService.error(texts.RUN_WORKFLOW_FAILURE_NOTIFICATION);
      return [{ type: WorkflowActions.RUN_WORKFLOW_FAILURE }];
    }),
  );
}
