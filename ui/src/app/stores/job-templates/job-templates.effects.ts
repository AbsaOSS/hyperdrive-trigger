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
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as JobTemplatesActions from './job-templates.actions';
import { catchError, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import { JobTemplateService } from '../../services/job-template/job-template.service';
import { JobTemplateModel } from '../../models/jobTemplate.model';
import { WorkflowService } from '../../services/workflow/workflow.service';
import { ToastrService } from 'ngx-toastr';
import { texts } from '../../constants/texts.constants';
import { absoluteRoutes } from '../../constants/routes.constants';
import { Router } from '@angular/router';
import { AppState, selectJobTemplatesState } from '../app.reducers';
import * as fromJobTemplates from '../job-templates/job-templates.reducers';
import { ApiUtil } from '../../utils/api/api.util';
import { Store } from '@ngrx/store';
import { HistoryModel, HistoryPairModel } from '../../models/historyModel';
import { JobTemplateHistoryModel } from '../../models/jobTemplateHistoryModel';
import { WorkflowModel } from '../../models/workflow.model';

@Injectable()
export class JobTemplatesEffects {
  constructor(
    private actions: Actions,
    private jobTemplateService: JobTemplateService,
    private workflowService: WorkflowService,
    private toastrService: ToastrService,
    private router: Router,
    private store: Store<AppState>,
  ) {}

  jobTemplatesSearch = createEffect(() => {
    return this.actions.pipe(
      ofType(JobTemplatesActions.SEARCH_JOB_TEMPLATES),
      switchMap((action: JobTemplatesActions.SearchJobTemplates) => {
        return this.jobTemplateService.searchJobTemplates(action.payload).pipe(
          mergeMap((searchResult: TableSearchResponseModel<JobTemplateModel>) => {
            return [
              {
                type: JobTemplatesActions.SEARCH_JOB_TEMPLATES_SUCCESS,
                payload: { jobTemplatesSearchResponse: searchResult },
              },
            ];
          }),
          catchError(() => {
            return [
              {
                type: JobTemplatesActions.SEARCH_JOB_TEMPLATES_FAILURE,
              },
            ];
          }),
        );
      }),
    );
  });

  jobTemplateForFormGet = createEffect(() => {
    return this.actions.pipe(
      ofType(JobTemplatesActions.GET_JOB_TEMPLATE_FOR_FORM),
      switchMap((action: JobTemplatesActions.GetJobTemplateForForm) => {
        return this.jobTemplateService.getJobTemplate(action.payload).pipe(
          mergeMap((jobTemplate: JobTemplateModel) => {
            return [
              {
                type: JobTemplatesActions.SET_JOB_TEMPLATE_FOR_FORM,
                payload: jobTemplate,
              },
            ];
          }),
          catchError(() => {
            this.toastrService.error(texts.LOAD_JOB_TEMPLATE_FAILURE_NOTIFICATION);
            this.router.navigateByUrl(absoluteRoutes.JOB_TEMPLATES_HOME);
            return [
              {
                type: JobTemplatesActions.GET_JOB_TEMPLATE_FOR_FORM_FAILURE,
              },
            ];
          }),
        );
      }),
    );
  });

  jobTemplateUsageGet = createEffect(() => {
    return this.actions.pipe(
      ofType(JobTemplatesActions.GET_JOB_TEMPLATE_USAGE),
      switchMap((action: JobTemplatesActions.GetJobTemplateUsage) => {
        return this.jobTemplateService.getJobTemplateUsage(action.payload).pipe(
          mergeMap((workflows: WorkflowModel[]) => {
            return [
              {
                type: JobTemplatesActions.GET_JOB_TEMPLATE_USAGE_SUCCESS,
                payload: workflows.sort(
                  (workflowLeft, workflowRight) =>
                    workflowLeft.project.localeCompare(workflowRight.project) || workflowLeft.name.localeCompare(workflowRight.name),
                ),
              },
            ];
          }),
          catchError(() => {
            this.toastrService.error(texts.GET_JOB_TEMPLATE_USAGE_FAILURE_NOTIFICATION);
            return [
              {
                type: JobTemplatesActions.GET_JOB_TEMPLATE_USAGE_FAILURE,
              },
            ];
          }),
        );
      }),
    );
  });

  jobTemplateCreate = createEffect(() => {
    return this.actions.pipe(
      ofType(JobTemplatesActions.CREATE_JOB_TEMPLATE),
      withLatestFrom(this.store.select(selectJobTemplatesState)),
      switchMap(([_, state]: [JobTemplatesActions.CreateJobTemplate, fromJobTemplates.State]) => {
        return this.jobTemplateService.createJobTemplate(state.jobTemplateAction.jobTemplate).pipe(
          mergeMap((jobTemplate: JobTemplateModel) => {
            this.toastrService.success(texts.CREATE_JOB_TEMPLATE_SUCCESS_NOTIFICATION);
            this.router.navigateByUrl(absoluteRoutes.SHOW_JOB_TEMPLATE + '/' + jobTemplate.id);

            return [
              {
                type: JobTemplatesActions.CREATE_JOB_TEMPLATE_SUCCESS,
                payload: jobTemplate,
              },
            ];
          }),
          catchError((errorResponse) => {
            if (ApiUtil.isBackendValidationError(errorResponse)) {
              return [
                {
                  type: JobTemplatesActions.CREATE_JOB_TEMPLATE_FAILURE,
                  payload: errorResponse.map((err) => err.message),
                },
              ];
            } else {
              this.toastrService.error(texts.CREATE_JOB_TEMPLATE_FAILURE_NOTIFICATION);
              return [
                {
                  type: JobTemplatesActions.CREATE_JOB_TEMPLATE_FAILURE,
                  payload: [],
                },
              ];
            }
          }),
        );
      }),
    );
  });

  jobTemplateUpdate = createEffect(() => {
    return this.actions.pipe(
      ofType(JobTemplatesActions.UPDATE_JOB_TEMPLATE),
      withLatestFrom(this.store.select(selectJobTemplatesState)),
      switchMap(([_, state]: [JobTemplatesActions.UpdateJobTemplate, fromJobTemplates.State]) => {
        return this.jobTemplateService.updateJobTemplate(state.jobTemplateAction.jobTemplate).pipe(
          mergeMap((jobTemplate: JobTemplateModel) => {
            this.toastrService.success(texts.UPDATE_JOB_TEMPLATE_SUCCESS_NOTIFICATION);
            this.router.navigateByUrl(absoluteRoutes.SHOW_JOB_TEMPLATE + '/' + jobTemplate.id);

            return [
              {
                type: JobTemplatesActions.UPDATE_JOB_TEMPLATE_SUCCESS,
                payload: jobTemplate,
              },
            ];
          }),
          catchError((errorResponse) => {
            if (ApiUtil.isBackendValidationError(errorResponse)) {
              return [
                {
                  type: JobTemplatesActions.UPDATE_JOB_TEMPLATE_FAILURE,
                  payload: errorResponse.map((err) => err.message),
                },
              ];
            } else {
              this.toastrService.error(texts.UPDATE_JOB_TEMPLATE_FAILURE_NOTIFICATION);
              return [
                {
                  type: JobTemplatesActions.UPDATE_JOB_TEMPLATE_FAILURE,
                  payload: [],
                },
              ];
            }
          }),
        );
      }),
    );
  });

  jobTemplateDelete = createEffect(() => {
    return this.actions.pipe(
      ofType(JobTemplatesActions.DELETE_JOB_TEMPLATE),
      switchMap((action: JobTemplatesActions.DeleteJobTemplate) => {
        return this.jobTemplateService.deleteJobTemplate(action.payload).pipe(
          mergeMap((result: boolean) => {
            if (result) {
              this.router.navigateByUrl(absoluteRoutes.JOB_TEMPLATES_HOME);
              this.toastrService.success(texts.DELETE_JOB_TEMPLATE_SUCCESS_NOTIFICATION);
              return [
                {
                  type: JobTemplatesActions.DELETE_JOB_TEMPLATE_SUCCESS,
                  payload: action.payload,
                },
              ];
            } else {
              this.toastrService.error(texts.DELETE_JOB_TEMPLATE_FAILURE_NOTIFICATION);
              return [
                {
                  type: JobTemplatesActions.DELETE_JOB_TEMPLATE_FAILURE,
                },
              ];
            }
          }),
          catchError(() => {
            this.toastrService.error(texts.DELETE_JOB_TEMPLATE_FAILURE_NOTIFICATION);
            return [
              {
                type: JobTemplatesActions.DELETE_JOB_TEMPLATE_FAILURE,
              },
            ];
          }),
        );
      }),
    );
  });

  historyForJobTemplateLoad = createEffect(() => {
    return this.actions.pipe(
      ofType(JobTemplatesActions.LOAD_HISTORY_FOR_JOB_TEMPLATE),
      switchMap((action: JobTemplatesActions.LoadHistoryForJobTemplate) => {
        return this.jobTemplateService.getHistoryForJobTemplate(action.payload).pipe(
          mergeMap((historyForJobTemplate: HistoryModel[]) => {
            return [
              {
                type: JobTemplatesActions.LOAD_HISTORY_FOR_JOB_TEMPLATE_SUCCESS,
                payload: historyForJobTemplate.sort((left, right) => right.id - left.id),
              },
            ];
          }),
          catchError(() => {
            this.toastrService.error(texts.LOAD_HISTORY_FOR_JOB_TEMPLATE_FAILURE_NOTIFICATION);
            return [
              {
                type: JobTemplatesActions.LOAD_HISTORY_FOR_JOB_TEMPLATE_FAILURE,
              },
            ];
          }),
        );
      }),
    );
  });

  jobTemplatesFromHistoryLoad = createEffect(() => {
    return this.actions.pipe(
      ofType(JobTemplatesActions.LOAD_JOB_TEMPLATES_FROM_HISTORY),
      switchMap((action: JobTemplatesActions.LoadJobTemplatesFromHistory) => {
        return this.jobTemplateService.getJobTemplatesFromHistory(action.payload.leftHistoryId, action.payload.rightHistoryId).pipe(
          mergeMap((jobTemplateHistoryPair: HistoryPairModel<JobTemplateHistoryModel>) => {
            return [
              {
                type: JobTemplatesActions.LOAD_JOB_TEMPLATES_FROM_HISTORY_SUCCESS,
                payload: {
                  leftHistory: jobTemplateHistoryPair.leftHistory,
                  rightHistory: jobTemplateHistoryPair.rightHistory,
                },
              },
            ];
          }),
          catchError(() => {
            this.toastrService.error(texts.LOAD_JOB_TEMPLATES_FROM_HISTORY_FAILURE_NOTIFICATION);
            return [
              {
                type: JobTemplatesActions.LOAD_JOB_TEMPLATES_FROM_HISTORY_FAILURE,
              },
            ];
          }),
        );
      }),
    );
  });

  jobTemplateRevert = createEffect(() => {
    return this.actions.pipe(
      ofType(JobTemplatesActions.REVERT_JOB_TEMPLATE),
      switchMap((action: JobTemplatesActions.RevertJobTemplate) => {
        return this.jobTemplateService.getJobTemplateFromHistory(action.payload).pipe(
          mergeMap((jobTemplate: JobTemplateModel) => {
            return [
              {
                type: JobTemplatesActions.REVERT_JOB_TEMPLATE_SUCCESS,
                payload: jobTemplate,
              },
            ];
          }),
          catchError(() => {
            this.toastrService.error(texts.LOAD_JOB_TEMPLATE_FAILURE_NOTIFICATION);
            return [
              {
                type: JobTemplatesActions.REVERT_JOB_TEMPLATE_FAILURE,
              },
            ];
          }),
        );
      }),
    );
  });
}
