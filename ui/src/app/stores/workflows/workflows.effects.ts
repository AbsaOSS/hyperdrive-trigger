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
import { DynamicFormParts, WorkflowFormPartsModel, WorkflowFormPartsModelFactory } from '../../models/workflowFormParts.model';
import { workflowFormParts as workflowFormPartsConsts, workflowFormPartsSequences } from '../../constants/workflowFormParts.constants';
import { AppState, selectWorkflowState } from '../app.reducers';
import { Store } from '@ngrx/store';
import * as fromWorkflows from './workflows.reducers';
import { WorkflowDataModel } from '../../models/workflowData.model';
import { Router } from '@angular/router';
import { absoluteRoutes } from '../../constants/routes.constants';
import { ToastrService } from 'ngx-toastr';
import { texts } from '../../constants/texts.constants';
import { WorkflowModel, WorkflowModelFactory } from '../../models/workflow.model';
import { WorkflowRequestModel } from '../../models/workflowRequest.model';
import { HistoryModel, HistoryPairModel, WorkflowHistoryModel } from '../../models/historyModel';
import { WorkflowHistoryService } from '../../services/workflowHistory/workflow-history.service';
import { JobService } from '../../services/job/job.service';
import { JobForRunModel } from '../../models/jobForRun.model';
import { EMPTY } from 'rxjs';
import { ApiErrorModel } from '../../models/errors/apiError.model';
import { BulkOperationErrorModel } from '../../models/errors/bulkOperationError.model';
import { UtilService } from '../../services/util/util.service';
import groupBy from 'lodash-es/groupBy';
import { ApiUtil } from '../../utils/api/api.util';
import { JobTemplateModel } from '../../models/jobTemplate.model';

@Injectable()
export class WorkflowsEffects {
  constructor(
    private actions: Actions,
    private workflowService: WorkflowService,
    private workflowHistoryService: WorkflowHistoryService,
    private jobService: JobService,
    private store: Store<AppState>,
    private router: Router,
    private toastrService: ToastrService,
    private utilService: UtilService,
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
          const workflowFormParts = this.getWorkflowFormParts(workflowComponents);
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
              const workflowData = new WorkflowDataModel(worfklow, state.workflowAction.workflowFormParts.dynamicParts);

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
  updateWorkflowsIsActive = this.actions.pipe(
    ofType(WorkflowActions.UPDATE_WORKFLOWS_IS_ACTIVE),
    switchMap((action: WorkflowActions.UpdateWorkflowsIsActive) => {
      return this.workflowService.updateWorkflowsIsActive(action.payload.ids, action.payload.isActiveNewValue).pipe(
        mergeMap((result: boolean) => {
          if (result) {
            this.toastrService.success(texts.UPDATE_WORKFLOWS_IS_ACTIVE_SUCCESS_NOTIFICATION(action.payload.isActiveNewValue));
            return [
              {
                type: WorkflowActions.UPDATE_WORKFLOWS_IS_ACTIVE_SUCCESS,
                payload: action.payload,
              },
            ];
          } else {
            this.toastrService.error(texts.UPDATE_WORKFLOWS_IS_ACTIVE_FAILURE_NOTIFICATION);
            return [
              {
                type: WorkflowActions.UPDATE_WORKFLOWS_IS_ACTIVE_FAILURE,
              },
            ];
          }
        }),
        catchError(() => {
          this.toastrService.error(texts.UPDATE_WORKFLOWS_IS_ACTIVE_FAILURE_NOTIFICATION);
          return [
            {
              type: WorkflowActions.UPDATE_WORKFLOWS_IS_ACTIVE_FAILURE,
            },
          ];
        }),
      );
    }),
  );

  @Effect({ dispatch: true })
  workflowCreate = this.actions.pipe(
    ofType(WorkflowActions.CREATE_WORKFLOW),
    withLatestFrom(this.store.select(selectWorkflowState)),
    switchMap(([action, state]: [WorkflowActions.CreateWorkflow, fromWorkflows.State]) => {
      return this.workflowService.getJobTemplates().pipe(
        mergeMap((jobTemplates: JobTemplateModel[]) => {
          const workflowCreateRequest = new WorkflowRequestModel(
            state.workflowAction.workflowFormData.details,
            state.workflowAction.workflowFormData.sensor,
            state.workflowAction.workflowFormData.jobs,
            jobTemplates,
          ).getCreateWorkflowRequestObject();

          return this.workflowService.createWorkflow(workflowCreateRequest).pipe(
            mergeMap((result: WorkflowJoinedModel) => {
              const workflow: WorkflowModel = WorkflowModelFactory.create(
                result.name,
                result.isActive,
                result.project,
                result.created,
                result.updated,
                result.id,
              );
              this.toastrService.success(texts.CREATE_WORKFLOW_SUCCESS_NOTIFICATION);
              this.router.navigateByUrl(absoluteRoutes.SHOW_WORKFLOW + '/' + workflow.id);

              return [
                {
                  type: WorkflowActions.CREATE_WORKFLOW_SUCCESS,
                  payload: workflow,
                },
              ];
            }),
            catchError((errorResponse) => {
              if (ApiUtil.isBackendValidationError(errorResponse)) {
                return [
                  {
                    type: WorkflowActions.CREATE_WORKFLOW_FAILURE,
                    payload: errorResponse.map((err) => err.message),
                  },
                ];
              } else {
                this.toastrService.error(texts.CREATE_WORKFLOW_FAILURE_NOTIFICATION);
                return [
                  {
                    type: WorkflowActions.CREATE_WORKFLOW_FAILURE,
                    payload: [],
                  },
                ];
              }
            }),
          );
        }),
        catchError(() => {
          this.toastrService.error(texts.LOAD_JOB_TEMPLATES_FAILURE_NOTIFICATION);
          return [
            {
              type: WorkflowActions.CREATE_WORKFLOW_FAILURE,
              payload: [],
            },
          ];
        }),
      );
    }),
  );

  @Effect({ dispatch: true })
  workflowUpdate = this.actions.pipe(
    ofType(WorkflowActions.UPDATE_WORKFLOW),
    withLatestFrom(this.store.select(selectWorkflowState)),
    switchMap(([action, state]: [WorkflowActions.CreateWorkflow, fromWorkflows.State]) => {
      return this.workflowService.getJobTemplates().pipe(
        mergeMap((jobTemplates: JobTemplateModel[]) => {
          const workflowUpdateRequest = new WorkflowRequestModel(
            state.workflowAction.workflowFormData.details,
            state.workflowAction.workflowFormData.sensor,
            state.workflowAction.workflowFormData.jobs,
            jobTemplates,
          ).getUpdateWorkflowRequestObject(state.workflowAction.id);

          return this.workflowService.updateWorkflow(workflowUpdateRequest).pipe(
            mergeMap((result: WorkflowJoinedModel) => {
              const workflow: WorkflowModel = WorkflowModelFactory.create(
                result.name,
                result.isActive,
                result.project,
                result.created,
                result.updated,
                result.id,
              );
              this.toastrService.success(texts.UPDATE_WORKFLOW_SUCCESS_NOTIFICATION);
              this.router.navigateByUrl(absoluteRoutes.SHOW_WORKFLOW + '/' + workflow.id);

              return [
                {
                  type: WorkflowActions.UPDATE_WORKFLOW_SUCCESS,
                  payload: workflow,
                },
              ];
            }),
            catchError((errorResponse) => {
              if (ApiUtil.isBackendValidationError(errorResponse)) {
                return [
                  {
                    type: WorkflowActions.UPDATE_WORKFLOW_FAILURE,
                    payload: errorResponse.map((err) => err.message),
                  },
                ];
              } else {
                this.toastrService.error(texts.UPDATE_WORKFLOW_FAILURE_NOTIFICATION);
                return [
                  {
                    type: WorkflowActions.UPDATE_WORKFLOW_FAILURE,
                    payload: [],
                  },
                ];
              }
            }),
          );
        }),
      );
    }),
  );

  @Effect({ dispatch: true })
  historyForWorkflowLoad = this.actions.pipe(
    ofType(WorkflowActions.LOAD_HISTORY_FOR_WORKFLOW),
    switchMap((action: WorkflowActions.LoadHistoryForWorkflow) => {
      return this.workflowHistoryService.getHistoryForWorkflow(action.payload).pipe(
        mergeMap((historyForWorkflow: HistoryModel[]) => {
          return [
            {
              type: WorkflowActions.LOAD_HISTORY_FOR_WORKFLOW_SUCCESS,
              payload: historyForWorkflow.sort((left, right) => right.id - left.id),
            },
          ];
        }),
        catchError(() => {
          this.toastrService.error(texts.LOAD_HISTORY_FOR_WORKFLOW_FAILURE_NOTIFICATION);
          return [
            {
              type: WorkflowActions.LOAD_HISTORY_FOR_WORKFLOW_FAILURE,
            },
          ];
        }),
      );
    }),
  );

  @Effect({ dispatch: true })
  workflowsFromHistoryLoad = this.actions.pipe(
    ofType(WorkflowActions.LOAD_WORKFLOWS_FROM_HISTORY),
    switchMap((action: WorkflowActions.LoadWorkflowsFromHistory) => {
      return this.workflowHistoryService.getWorkflowsFromHistory(
        action.payload.leftWorkflowHistoryId,
        action.payload.rightWorkflowHistoryId,
      );
    }),
    mergeMap((workflowHistForComparison: HistoryPairModel<WorkflowHistoryModel>) => {
      return this.workflowService.getWorkflowDynamicFormParts().pipe(
        mergeMap((workflowComponents: DynamicFormParts) => {
          const workflowFormParts = this.getWorkflowFormParts(workflowComponents);

          const leftWorkflowHistory = new WorkflowDataModel(workflowHistForComparison.leftHistory.workflow, workflowFormParts.dynamicParts);
          const rightWorkflowHistory = new WorkflowDataModel(
            workflowHistForComparison.rightHistory.workflow,
            workflowFormParts.dynamicParts,
          );
          return [
            {
              type: WorkflowActions.LOAD_WORKFLOWS_FROM_HISTORY_SUCCESS,
              payload: {
                workflowFormParts: workflowFormParts,
                leftWorkflowHistoryData: leftWorkflowHistory.getWorkflowFromData(),
                leftWorkflowHistory: workflowHistForComparison.leftHistory.history,
                rightWorkflowHistoryData: rightWorkflowHistory.getWorkflowFromData(),
                rightWorkflowHistory: workflowHistForComparison.rightHistory.history,
              },
            },
          ];
        }),
      );
    }),
    catchError(() => {
      this.toastrService.error(texts.LOAD_WORKFLOWS_FROM_HISTORY_FAILURE_NOTIFICATION);
      return [
        {
          type: WorkflowActions.LOAD_WORKFLOWS_FROM_HISTORY_FAILURE,
        },
      ];
    }),
  );

  getWorkflowFormParts(workflowComponents: DynamicFormParts): WorkflowFormPartsModel {
    return WorkflowFormPartsModelFactory.create(
      workflowFormPartsSequences.allDetails,
      workflowFormPartsConsts.SENSOR.SENSOR_TYPE,
      workflowFormPartsConsts.JOB.JOB_NAME,
      workflowFormPartsConsts.JOB.JOB_TEMPLATE_ID,
      workflowComponents,
    );
  }

  @Effect({ dispatch: true })
  jobsForRunLoad = this.actions.pipe(
    ofType(WorkflowActions.LOAD_JOBS_FOR_RUN),
    switchMap((action: WorkflowActions.LoadJobsForRun) => {
      return this.jobService.getJobsForRun(action.payload).pipe(
        mergeMap((result: JobForRunModel[]) => {
          return [
            {
              type: WorkflowActions.LOAD_JOBS_FOR_RUN_SUCCESS,
              payload: result,
            },
          ];
        }),
        catchError(() => {
          this.toastrService.error(texts.LOAD_JOBS_FOR_RUN_FAILURE_NOTIFICATION);
          return [
            {
              type: WorkflowActions.LOAD_JOBS_FOR_RUN_FAILURE,
            },
          ];
        }),
      );
    }),
  );

  @Effect({ dispatch: false })
  jobsRun = this.actions.pipe(
    ofType(WorkflowActions.RUN_JOBS),
    switchMap((action: WorkflowActions.RunJobs) => {
      return this.workflowService.runWorkflowJobs(action.payload.workflowId, action.payload.jobs).pipe(
        mergeMap((runWorkflowSuccess) => {
          if (runWorkflowSuccess) {
            this.toastrService.success(texts.RUN_WORKFLOWS_JOBS_SUCCESS_NOTIFICATION);
            return [
              {
                type: EMPTY,
              },
            ];
          } else {
            this.toastrService.error(texts.RUN_WORKFLOWS_JOBS_FAILURE_NOTIFICATION);
            return [
              {
                type: EMPTY,
              },
            ];
          }
        }),
        catchError(() => {
          this.toastrService.error(texts.RUN_WORKFLOWS_JOBS_FAILURE_NOTIFICATION);
          return [
            {
              type: EMPTY,
            },
          ];
        }),
      );
    }),
  );

  @Effect({ dispatch: false })
  workflowsRun = this.actions.pipe(
    ofType(WorkflowActions.RUN_WORKFLOWS),
    switchMap((action: WorkflowActions.RunWorkflows) => {
      return this.workflowService.runWorkflows(action.payload).pipe(
        mergeMap((runWorkflowsSuccess) => {
          if (runWorkflowsSuccess) {
            this.toastrService.success(texts.RUN_WORKFLOWS_SUCCESS_NOTIFICATION);
            return [
              {
                type: EMPTY,
              },
            ];
          } else {
            this.toastrService.error(texts.RUN_WORKFLOWS_FAILURE_NOTIFICATION);
            return [
              {
                type: EMPTY,
              },
            ];
          }
        }),
        catchError((errorResponse) => {
          if (ApiUtil.isApiError(errorResponse)) {
            const message = ApiUtil.concatenateApiErrors(errorResponse as ApiErrorModel[]);
            this.toastrService.error(message);
          } else {
            this.toastrService.error(texts.RUN_WORKFLOWS_FAILURE_NOTIFICATION);
          }
          return [
            {
              type: EMPTY,
            },
          ];
        }),
      );
    }),
  );

  @Effect({ dispatch: true })
  workflowExport = this.actions.pipe(
    ofType(WorkflowActions.EXPORT_WORKFLOWS),
    switchMap((action: WorkflowActions.ExportWorkflows) => {
      return this.workflowService.exportWorkflows(action.payload).pipe(
        mergeMap((workflowBlobResponse: { blob: Blob; fileName: string }) => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(workflowBlobResponse.blob);

          a.download = workflowBlobResponse.fileName.trim();
          a.click();
          a.remove();

          this.toastrService.success(texts.EXPORT_WORKFLOWS_SUCCESS_NOTIFICATION);
          return [
            {
              type: WorkflowActions.EXPORT_WORKFLOWS_DONE,
            },
          ];
        }),
        catchError((errorResponse) => {
          if (ApiUtil.isApiError(errorResponse)) {
            const message = ApiUtil.concatenateApiErrors(errorResponse as ApiErrorModel[]);
            this.toastrService.error(message);
          } else {
            this.toastrService.error(texts.EXPORT_WORKFLOWS_FAILURE_NOTIFICATION);
          }
          return [
            {
              type: WorkflowActions.EXPORT_WORKFLOWS_DONE,
            },
          ];
        }),
      );
    }),
  );

  @Effect({ dispatch: true })
  workflowImport = this.actions.pipe(
    ofType(WorkflowActions.IMPORT_WORKFLOW),
    withLatestFrom(this.store.select(selectWorkflowState)),
    switchMap(([action, state]: [WorkflowActions.ImportWorkflow, fromWorkflows.State]) => {
      if (state.workflowAction.workflowFile) {
        return this.workflowService.importWorkflow(state.workflowAction.workflowFile).pipe(
          mergeMap((workflow: WorkflowJoinedModel) => {
            this.toastrService.success(texts.IMPORT_WORKFLOW_SUCCESS_NOTIFICATION);
            const workflowData = new WorkflowDataModel(workflow, state.workflowAction.workflowFormParts.dynamicParts);
            return [
              {
                type: WorkflowActions.LOAD_WORKFLOW_SUCCESS,
                payload: {
                  workflow: workflow,
                  detailsData: workflowData.getDetailsData(),
                  sensorData: workflowData.getSensorData(),
                  jobsData: workflowData.getJobsData(),
                },
              },
            ];
          }),
          catchError((errorResponse) => {
            if (ApiUtil.isApiError(errorResponse)) {
              const message = ApiUtil.concatenateApiErrors(errorResponse as ApiErrorModel[]);
              this.toastrService.error(message);
            } else {
              this.toastrService.error(texts.IMPORT_WORKFLOW_FAILURE_NOTIFICATION);
            }
            this.router.navigateByUrl(absoluteRoutes.WORKFLOWS);
            return [
              {
                type: WorkflowActions.IMPORT_WORKFLOW_FAILURE,
              },
            ];
          }),
        );
      } else {
        this.toastrService.error(texts.IMPORT_WORKFLOW_FAILURE_NOTIFICATION);
        this.router.navigateByUrl(absoluteRoutes.WORKFLOWS);
        return [
          {
            type: WorkflowActions.IMPORT_WORKFLOW_FAILURE,
          },
        ];
      }
    }),
  );

  @Effect({ dispatch: true })
  workflowsImport = this.actions.pipe(
    ofType(WorkflowActions.IMPORT_WORKFLOWS),
    switchMap((action: WorkflowActions.ImportWorkflows) => {
      return this.workflowService.importWorkflows(action.payload).pipe(
        mergeMap((projects: ProjectModel[]) => {
          this.toastrService.success(texts.IMPORT_WORKFLOWS_SUCCESS_NOTIFICATION);
          return [
            {
              type: WorkflowActions.IMPORT_WORKFLOWS_SUCCESS,
              payload: projects,
            },
          ];
        }),
        catchError((errorResponse) => {
          if (ApiUtil.isBulkOperationError(errorResponse)) {
            const errorGroups: { [key: string]: BulkOperationErrorModel[] } = groupBy(
              errorResponse as BulkOperationErrorModel[],
              'workflowIdentifier',
            );
            const errorMessageGroups: { [key: string]: string[] } = {};
            for (const [key, value] of Object.entries(errorGroups)) {
              errorMessageGroups[key] = value.map((bulkOperationError) => bulkOperationError.innerError.message);
            }

            const message = this.utilService.generateBulkErrorMessage(errorMessageGroups);
            this.toastrService.error(message, texts.IMPORT_WORKFLOWS_BULK_FAILURE_TITLE, {
              closeButton: true,
              disableTimeOut: true,
              tapToDismiss: false,
              enableHtml: true,
              toastClass: 'toastr-multi-import-error ngx-toastr',
            });
          } else {
            this.toastrService.error(texts.IMPORT_WORKFLOWS_FAILURE_NOTIFICATION);
          }
          return [
            {
              type: WorkflowActions.IMPORT_WORKFLOWS_FAILURE,
            },
          ];
        }),
      );
    }),
  );
}
