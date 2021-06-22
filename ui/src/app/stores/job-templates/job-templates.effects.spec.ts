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

import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Actions } from '@ngrx/effects';
import { cold } from 'jasmine-marbles';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import { SortAttributesModel } from '../../models/search/sortAttributes.model';
import { JobTemplatesEffects } from './job-templates.effects';
import { JobTemplateService } from '../../services/job-template/job-template.service';
import { JobTemplateModel, JobTemplateModelFactory } from '../../models/jobTemplate.model';
import { GetJobTemplateForForm, SearchJobTemplates, SetJobTemplateForFrom } from './job-templates.actions';
import * as JobTemplatesActions from './job-templates.actions';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';
import { WorkflowService } from '../../services/workflow/workflow.service';
import { DynamicFormPart } from '../../models/workflowFormParts.model';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { texts } from '../../constants/texts.constants';
import { absoluteRoutes } from '../../constants/routes.constants';
import { SparkTemplateParametersModel } from '../../models/jobTemplateParameters.model';

describe('JobTemplatesEffects', () => {
  let underTest: JobTemplatesEffects;
  let jobTemplateService: Spy<JobTemplateService>;
  let workflowService: Spy<WorkflowService>;
  let mockActions: Observable<any>;
  let toastrServiceSpy: Spy<ToastrService>;
  let routerSpy: Spy<Router>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        JobTemplatesEffects,
        { provide: JobTemplateService, useValue: createSpyFromClass(JobTemplateService) },
        { provide: WorkflowService, useValue: createSpyFromClass(WorkflowService) },
        { provide: ToastrService, useValue: createSpyFromClass(ToastrService) },
        { provide: Router, useValue: createSpyFromClass(Router) },
        provideMockActions(() => mockActions),
      ],
      imports: [HttpClientTestingModule],
    });

    underTest = TestBed.inject(JobTemplatesEffects);
    jobTemplateService = TestBed.inject<any>(JobTemplateService);
    workflowService = TestBed.inject<any>(WorkflowService);
    mockActions = TestBed.inject(Actions);
    toastrServiceSpy = TestBed.inject<any>(ToastrService);
    routerSpy = TestBed.inject<any>(Router);
  });

  describe('jobTemplatesSearch', () => {
    it('should return job templates', () => {
      const jobTemplate = JobTemplateModelFactory.create(
        0,
        'templateName',
        'fromConfig',
        { name: 'jobType' },
        SparkTemplateParametersModel.createEmpty(),
      );

      const searchResponse = new TableSearchResponseModel<JobTemplateModel>([jobTemplate], 1);

      const action = new SearchJobTemplates({ from: 0, size: 0, sort: new SortAttributesModel('', 0) });
      mockActions = cold('-a', { a: action });
      const searchJobTemplatesResponse = cold('-a|', { a: searchResponse });
      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.SEARCH_JOB_TEMPLATES_SUCCESS,
          payload: { jobTemplatesSearchResponse: searchResponse },
        },
      });
      jobTemplateService.searchJobTemplates.and.returnValue(searchJobTemplatesResponse);

      expect(underTest.jobTemplatesSearch).toBeObservable(expected);
    });

    it('should return search job templates failure if jobTemplateService.searchJobTemplates responds with an error', () => {
      const action = new SearchJobTemplates({ from: 0, size: 0, sort: new SortAttributesModel('', 0) });
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|');
      jobTemplateService.searchJobTemplates.and.returnValue(errorResponse);

      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.SEARCH_JOB_TEMPLATES_FAILURE,
        },
      });
      expect(underTest.jobTemplatesSearch).toBeObservable(expected);
    });
  });

  describe('jobTemplateForFormGet', () => {
    it('should return job template', () => {
      const jobTemplate = JobTemplateModelFactory.create(
        10,
        'templateName',
        'fromConfig',
        { name: 'jobType' },
        SparkTemplateParametersModel.createEmpty(),
      );

      const action = new GetJobTemplateForForm(jobTemplate.id);
      mockActions = cold('-a', { a: action });
      const getJobTemplateResponse = cold('-a|', { a: jobTemplate });
      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.SET_JOB_TEMPLATE_FOR_FORM,
          payload: jobTemplate,
        },
      });
      jobTemplateService.getJobTemplate.and.returnValue(getJobTemplateResponse);

      expect(underTest.jobTemplateForFormGet).toBeObservable(expected);
    });

    it('should return get job template failure if jobTemplateService.getJobTemplate responds with an error', () => {
      const toastrServiceErrorSpy = toastrServiceSpy.error;
      const routerNavigateByUrlSpy = routerSpy.navigateByUrl;

      const action = new GetJobTemplateForForm(10);
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|');
      jobTemplateService.getJobTemplate.and.returnValue(errorResponse);

      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.GET_JOB_TEMPLATE_FOR_FORM_FAILURE,
        },
      });
      expect(underTest.jobTemplateForFormGet).toBeObservable(expected);
      expect(toastrServiceErrorSpy).toHaveBeenCalledWith(texts.LOAD_JOB_TEMPLATE_FAILURE_NOTIFICATION);
      expect(routerNavigateByUrlSpy).toHaveBeenCalledWith(absoluteRoutes.JOB_TEMPLATES_HOME);
    });
  });

  describe('jobTemplateForFormSet', () => {
    it('should return get job template failure if workflowService.getJobDynamicFormParts responds empty array', () => {
      const jobTemplate = JobTemplateModelFactory.create(
        10,
        'templateName',
        'fromConfig',
        { name: 'jobType' },
        SparkTemplateParametersModel.createEmpty(),
      );
      const dynamicFormParts: DynamicFormPart[] = [];

      const action = new SetJobTemplateForFrom(jobTemplate);
      mockActions = cold('-a', { a: action });
      const getJobDynamicFormPartsResponse = cold('-a|', { a: dynamicFormParts });
      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.GET_JOB_TEMPLATE_FOR_FORM_FAILURE,
        },
      });
      workflowService.getJobDynamicFormParts.and.returnValue(getJobDynamicFormPartsResponse);

      expect(underTest.jobTemplateForFormSet).toBeObservable(expected);
    });

    it('should return get job template failure if workflowService.getJobDynamicFormParts responds with an error', () => {
      const jobTemplate = JobTemplateModelFactory.create(
        10,
        'templateName',
        'fromConfig',
        { name: 'jobType' },
        SparkTemplateParametersModel.createEmpty(),
      );
      const action = new SetJobTemplateForFrom(jobTemplate);
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|');
      workflowService.getJobDynamicFormParts.and.returnValue(errorResponse);

      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.GET_JOB_TEMPLATE_FOR_FORM_FAILURE,
        },
      });
      expect(underTest.jobTemplateForFormSet).toBeObservable(expected);
    });
  });
});
