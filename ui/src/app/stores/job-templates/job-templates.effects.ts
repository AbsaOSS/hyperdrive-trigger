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
import * as JobTemplatesActions from './job-templates.actions';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import { JobTemplateService } from '../../services/job-template/job-template.service';
import { JobTemplateModel } from '../../models/jobTemplate.model';
import { WorkflowService } from '../../services/workflow/workflow.service';

import { DynamicFormPart } from '../../models/workflowFormParts.model';

import get from 'lodash-es/get';
import { JobTemplateFormEntryModel, JobTemplateFormEntryModelFactory } from '../../models/jobTemplateFormEntry.model';
import { ToastrService } from 'ngx-toastr';
import { texts } from '../../constants/texts.constants';
import { absoluteRoutes } from '../../constants/routes.constants';
import { Router } from '@angular/router';

@Injectable()
export class JobTemplatesEffects {
  constructor(
    private actions: Actions,
    private jobTemplateService: JobTemplateService,
    private workflowService: WorkflowService,
    private toastrService: ToastrService,
    private router: Router,
  ) {}

  @Effect({ dispatch: true })
  jobTemplatesSearch = this.actions.pipe(
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

  @Effect({ dispatch: true })
  jobTemplateForFormGet = this.actions.pipe(
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

  @Effect({ dispatch: true })
  jobTemplateForFormSet = this.actions.pipe(
    ofType(JobTemplatesActions.SET_JOB_TEMPLATE_FOR_FORM),
    switchMap((action: JobTemplatesActions.SetJobTemplateForFrom) => {
      return this.workflowService.getJobDynamicFormParts().pipe(
        mergeMap((jobDynamicFormParts: DynamicFormPart[]) => {
          const jobTemplate: JobTemplateModel = action.payload;
          const jobDynamicPartOption = jobDynamicFormParts.find((part) => part.value == jobTemplate.jobParameters.jobType);
          if (jobDynamicPartOption != undefined) {
            const jobTemplateFormEntries: JobTemplateFormEntryModel[] = jobDynamicPartOption.parts
              .map((part) => {
                const value = get(jobTemplate, part.property);
                return JobTemplateFormEntryModelFactory.create(part, value);
              })
              .filter((part) => !!part.value);
            return [
              {
                type: JobTemplatesActions.SET_JOB_TEMPLATE_PARTS_FOR_FORM,
                payload: jobTemplateFormEntries,
              },
            ];
          } else {
            return [
              {
                type: JobTemplatesActions.GET_JOB_TEMPLATE_FOR_FORM_FAILURE,
              },
            ];
          }
        }),
        catchError(() => {
          return [
            {
              type: JobTemplatesActions.GET_JOB_TEMPLATE_FOR_FORM_FAILURE,
            },
          ];
        }),
      );
    }),
  );
}
