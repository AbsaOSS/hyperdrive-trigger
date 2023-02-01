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
import {
  CreateJobTemplate,
  DeleteJobTemplate,
  GetJobTemplateForForm,
  GetJobTemplateUsage,
  LoadHistoryForJobTemplate,
  LoadJobTemplatesFromHistory,
  RevertJobTemplate,
  SearchJobTemplates,
  UpdateJobTemplate,
} from './job-templates.actions';
import * as JobTemplatesActions from './job-templates.actions';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';
import { WorkflowService } from '../../services/workflow/workflow.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { texts } from '../../constants/texts.constants';
import { absoluteRoutes } from '../../constants/routes.constants';
import { SparkTemplateParametersModel } from '../../models/jobTemplateParameters.model';
import { provideMockStore } from '@ngrx/store/testing';
import { ApiErrorModelFactory } from '../../models/errors/apiError.model';
import { HistoryModel, HistoryModelFactory, HistoryPairModel } from '../../models/historyModel';
import { JobTemplateHistoryModelFactory } from '../../models/jobTemplateHistoryModel';
import { WorkflowModelFactory } from '../../models/workflow.model';

describe('JobTemplatesEffects', () => {
  let underTest: JobTemplatesEffects;
  let jobTemplateService: Spy<JobTemplateService>;
  let mockActions: Observable<any>;
  let toastrServiceSpy: Spy<ToastrService>;
  let routerSpy: Spy<Router>;

  const dummyJobTemplate = JobTemplateModelFactory.createEmpty();

  const initialAppState = {
    jobTemplates: {
      jobTemplateAction: {
        id: 10,
        loading: false,
        initialJobTemplate: dummyJobTemplate,
        jobTemplate: dummyJobTemplate,
        backendValidationErrors: [],
      },
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        JobTemplatesEffects,
        { provide: JobTemplateService, useValue: createSpyFromClass(JobTemplateService) },
        { provide: WorkflowService, useValue: createSpyFromClass(WorkflowService) },
        { provide: ToastrService, useValue: createSpyFromClass(ToastrService) },
        { provide: Router, useValue: createSpyFromClass(Router) },
        provideMockActions(() => mockActions),
        provideMockStore({ initialState: initialAppState }),
      ],
      imports: [HttpClientTestingModule],
    });

    underTest = TestBed.inject(JobTemplatesEffects);
    jobTemplateService = TestBed.inject<any>(JobTemplateService);
    mockActions = TestBed.inject(Actions);
    toastrServiceSpy = TestBed.inject<any>(ToastrService);
    routerSpy = TestBed.inject<any>(Router);
  });

  describe('jobTemplatesSearch', () => {
    it('should return job templates', () => {
      const jobTemplate = JobTemplateModelFactory.create(0, 'templateName', SparkTemplateParametersModel.createEmpty());

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
      const jobTemplate = JobTemplateModelFactory.create(10, 'templateName', SparkTemplateParametersModel.createEmpty());

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

  describe('jobTemplateCreate', () => {
    it('should return create job template failure with no backend validation errors when service fails to create job template', () => {
      const toastrServiceSpyError = toastrServiceSpy.error;

      const action = new CreateJobTemplate();
      mockActions = cold('-a', { a: action });
      const createJobTemplateResponse = cold('-#|', null, 'notValidationError');

      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.CREATE_JOB_TEMPLATE_FAILURE,
          payload: [],
        },
      });

      jobTemplateService.createJobTemplate.and.returnValue(createJobTemplateResponse);

      expect(underTest.jobTemplateCreate).toBeObservable(expected);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpyError).toHaveBeenCalledWith(texts.CREATE_JOB_TEMPLATE_FAILURE_NOTIFICATION);
    });

    it('should return create job template failure with backend validation errors when service fails to create job template', () => {
      const toastrServiceSpyError = toastrServiceSpy.error;
      const error = ApiErrorModelFactory.create('error', { name: 'validationError' });

      const action = new CreateJobTemplate();
      mockActions = cold('-a', { a: action });
      const createJobTemplateResponse = cold('-#|', null, [error]);

      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.CREATE_JOB_TEMPLATE_FAILURE,
          payload: [error.message],
        },
      });

      jobTemplateService.createJobTemplate.and.returnValue(createJobTemplateResponse);

      expect(underTest.jobTemplateCreate).toBeObservable(expected);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(0);
    });

    it('should return create job template success when service returns success creation', () => {
      const toastrServiceSpySuccess = toastrServiceSpy.success;
      const routerSpyNavigate = routerSpy.navigateByUrl;

      const jobTemplate = dummyJobTemplate;
      const createJobTemplateSuccessPayload: JobTemplateModel = jobTemplate;

      const action = new CreateJobTemplate();
      mockActions = cold('-a', { a: action });

      const createJobTemplateResponse = cold('-a|', { a: jobTemplate });

      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.CREATE_JOB_TEMPLATE_SUCCESS,
          payload: createJobTemplateSuccessPayload,
        },
      });

      jobTemplateService.createJobTemplate.and.returnValue(createJobTemplateResponse);

      expect(underTest.jobTemplateCreate).toBeObservable(expected);
      expect(toastrServiceSpySuccess).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpySuccess).toHaveBeenCalledWith(texts.CREATE_JOB_TEMPLATE_SUCCESS_NOTIFICATION);
      expect(routerSpyNavigate).toHaveBeenCalledTimes(1);
      expect(routerSpyNavigate).toHaveBeenCalledWith(absoluteRoutes.SHOW_JOB_TEMPLATE + '/' + jobTemplate.id);
    });
  });

  describe('jobTemplateUpdate', () => {
    it('should return update job template failure with no backend validation errors when service fails to update job template', () => {
      const toastrServiceSpyError = toastrServiceSpy.error;

      const action = new UpdateJobTemplate();
      mockActions = cold('-a', { a: action });
      const updateJobTemplateResponse = cold('-#|', null, 'notJobTemplateValidation');

      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.UPDATE_JOB_TEMPLATE_FAILURE,
          payload: [],
        },
      });

      jobTemplateService.updateJobTemplate.and.returnValue(updateJobTemplateResponse);

      expect(underTest.jobTemplateUpdate).toBeObservable(expected);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpyError).toHaveBeenCalledWith(texts.UPDATE_JOB_TEMPLATE_FAILURE_NOTIFICATION);
    });

    it('should return update job template failure with backend validation errors when service fails to update job template', () => {
      const toastrServiceSpyError = toastrServiceSpy.error;
      const error = ApiErrorModelFactory.create('error', { name: 'validationError' });
      const action = new UpdateJobTemplate();
      mockActions = cold('-a', { a: action });
      const updateJobTemplateResponse = cold('-#|', null, [error]);

      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.UPDATE_JOB_TEMPLATE_FAILURE,
          payload: [error.message],
        },
      });

      jobTemplateService.updateJobTemplate.and.returnValue(updateJobTemplateResponse);

      expect(underTest.jobTemplateUpdate).toBeObservable(expected);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(0);
    });

    it('should return create job template success when service returns success creation', () => {
      const toastrServiceSpySuccess = toastrServiceSpy.success;
      const routerSpyNavigate = routerSpy.navigateByUrl;

      const jobTemplate = dummyJobTemplate;

      const action = new UpdateJobTemplate();
      mockActions = cold('-a', { a: action });

      const updateJobTemplateResponse = cold('-a|', { a: jobTemplate });

      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.UPDATE_JOB_TEMPLATE_SUCCESS,
          payload: jobTemplate,
        },
      });

      jobTemplateService.updateJobTemplate.and.returnValue(updateJobTemplateResponse);

      expect(underTest.jobTemplateUpdate).toBeObservable(expected);
      expect(toastrServiceSpySuccess).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpySuccess).toHaveBeenCalledWith(texts.UPDATE_JOB_TEMPLATE_SUCCESS_NOTIFICATION);
      expect(routerSpyNavigate).toHaveBeenCalledTimes(1);
      expect(routerSpyNavigate).toHaveBeenCalledWith(absoluteRoutes.SHOW_JOB_TEMPLATE + '/' + jobTemplate.id);
    });
  });

  describe('jobTemplateDelete', () => {
    it('should return delete job template success when service returns success deletion', () => {
      const toastrServiceSpySuccess = toastrServiceSpy.success;
      const routerSpyNavigate = routerSpy.navigateByUrl;
      const payload = 10;
      const response = true;

      const action = new DeleteJobTemplate(payload);
      mockActions = cold('-a', { a: action });

      const deleteJobTemplateResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.DELETE_JOB_TEMPLATE_SUCCESS,
          payload: payload,
        },
      });

      jobTemplateService.deleteJobTemplate.and.returnValue(deleteJobTemplateResponse);

      expect(underTest.jobTemplateDelete).toBeObservable(expected);
      expect(toastrServiceSpySuccess).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpySuccess).toHaveBeenCalledWith(texts.DELETE_JOB_TEMPLATE_SUCCESS_NOTIFICATION);
      expect(routerSpyNavigate).toHaveBeenCalledTimes(1);
      expect(routerSpyNavigate).toHaveBeenCalledWith(absoluteRoutes.JOB_TEMPLATES_HOME);
    });

    it('should return delete job template failure when service fails to delete job template', () => {
      const toastrServiceSpyError = toastrServiceSpy.error;
      const payload = 10;
      const response = false;

      const action = new DeleteJobTemplate(payload);
      mockActions = cold('-a', { a: action });

      const deleteJobTemplateResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.DELETE_JOB_TEMPLATE_FAILURE,
        },
      });

      jobTemplateService.deleteJobTemplate.and.returnValue(deleteJobTemplateResponse);

      expect(underTest.jobTemplateDelete).toBeObservable(expected);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpyError).toHaveBeenCalledWith(texts.DELETE_JOB_TEMPLATE_FAILURE_NOTIFICATION);
    });

    it('should return delete job template failure when service throws exception while deleting job template', () => {
      const toastrServiceSpyError = toastrServiceSpy.error;
      const payload = 10;
      const action = new DeleteJobTemplate(payload);
      mockActions = cold('-a', { a: action });

      const errorResponse = cold('-#|');
      jobTemplateService.deleteJobTemplate.and.returnValue(errorResponse);
      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.DELETE_JOB_TEMPLATE_FAILURE,
        },
      });
      expect(underTest.jobTemplateDelete).toBeObservable(expected);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpyError).toHaveBeenCalledWith(texts.DELETE_JOB_TEMPLATE_FAILURE_NOTIFICATION);
    });
  });

  describe('historyForJobTemplateLoad', () => {
    it('should successfully load history for job template', () => {
      const payload = 42;
      const response: HistoryModel[] = [HistoryModelFactory.create(1, new Date(Date.now()), 'userName', { name: 'operation' })];

      const action = new LoadHistoryForJobTemplate(payload);
      mockActions = cold('-a', { a: action });

      const getHistoryForJobTemplateResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.LOAD_HISTORY_FOR_JOB_TEMPLATE_SUCCESS,
          payload: response,
        },
      });

      jobTemplateService.getHistoryForJobTemplate.and.returnValue(getHistoryForJobTemplateResponse);

      expect(underTest.historyForJobTemplateLoad).toBeObservable(expected);
    });

    it('should display failure when service fails to load history for job template', () => {
      const toastrServiceSpyError = toastrServiceSpy.error;
      const payload = 42;

      const action = new LoadHistoryForJobTemplate(payload);
      mockActions = cold('-a', { a: action });

      const getHistoryForJobTemplateResponse = cold('-#|');
      jobTemplateService.getHistoryForJobTemplate.and.returnValue(getHistoryForJobTemplateResponse);

      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.LOAD_HISTORY_FOR_JOB_TEMPLATE_FAILURE,
        },
      });
      expect(underTest.historyForJobTemplateLoad).toBeObservable(expected);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpyError).toHaveBeenCalledWith(texts.LOAD_HISTORY_FOR_JOB_TEMPLATE_FAILURE_NOTIFICATION);
    });
  });

  describe('jobTemplatesFromHistoryLoad', () => {
    it('should load job templates from history', () => {
      const payload = {
        leftHistoryId: 1,
        rightHistoryId: 2,
      };
      const leftHistory = JobTemplateHistoryModelFactory.create(
        HistoryModelFactory.create(1, new Date(Date.now()), 'userName', { name: 'operation' }),
        1,
        dummyJobTemplate,
      );
      const rightHistory = JobTemplateHistoryModelFactory.create(
        HistoryModelFactory.create(2, new Date(Date.now()), 'userName', { name: 'operation' }),
        2,
        dummyJobTemplate,
      );
      const serviceResponse: HistoryPairModel<JobTemplateHistoryModelFactory> = {
        leftHistory: leftHistory,
        rightHistory: rightHistory,
      };
      const effectResponse = {
        leftHistory: leftHistory,
        rightHistory: rightHistory,
      };

      const action = new LoadJobTemplatesFromHistory(payload);
      mockActions = cold('-a', { a: action });
      const getJobTemplatesFromHistoryResponse = cold('-a|', { a: serviceResponse });
      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.LOAD_JOB_TEMPLATES_FROM_HISTORY_SUCCESS,
          payload: effectResponse,
        },
      });

      jobTemplateService.getJobTemplatesFromHistory.and.returnValue(getJobTemplatesFromHistoryResponse);

      expect(underTest.jobTemplatesFromHistoryLoad).toBeObservable(expected);
    });

    it('should display failure when service fails to load job templates from history', () => {
      const toastrServiceSpyError = toastrServiceSpy.error;
      const payload = {
        leftHistoryId: 1,
        rightHistoryId: 2,
      };

      const action = new LoadJobTemplatesFromHistory(payload);
      mockActions = cold('-a', { a: action });

      const getJobTemplatesFromHistoryResponse = cold('-#|');
      jobTemplateService.getJobTemplatesFromHistory.and.returnValue(getJobTemplatesFromHistoryResponse);

      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.LOAD_JOB_TEMPLATES_FROM_HISTORY_FAILURE,
        },
      });
      expect(underTest.jobTemplatesFromHistoryLoad).toBeObservable(expected);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpyError).toHaveBeenCalledWith(texts.LOAD_JOB_TEMPLATES_FROM_HISTORY_FAILURE_NOTIFICATION);
    });
  });

  describe('jobTemplateUsageGet', () => {
    it('should return job template usage', () => {
      const id = 0;
      const workflow = WorkflowModelFactory.create('workflowOne', undefined, undefined, undefined, undefined, undefined, undefined);

      const action = new GetJobTemplateUsage(id);
      mockActions = cold('-a', { a: action });
      const jobTemplateUsageResponse = cold('-a|', { a: [workflow] });
      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.GET_JOB_TEMPLATE_USAGE_SUCCESS,
          payload: [workflow],
        },
      });

      jobTemplateService.getJobTemplateUsage.and.returnValue(jobTemplateUsageResponse);

      expect(underTest.jobTemplateUsageGet).toBeObservable(expected);
    });

    it('should return job template usage failure if jobTemplateService.getJobTemplateUsage responds with an error', () => {
      const id = 0;
      const toastrServiceSpyError = toastrServiceSpy.error;
      const action = new GetJobTemplateUsage(id);
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|');
      jobTemplateService.getJobTemplateUsage.and.returnValue(errorResponse);

      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.GET_JOB_TEMPLATE_USAGE_FAILURE,
        },
      });
      expect(underTest.jobTemplateUsageGet).toBeObservable(expected);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpyError).toHaveBeenCalledWith(texts.GET_JOB_TEMPLATE_USAGE_FAILURE_NOTIFICATION);
    });
  });

  describe('jobTemplateRevert', () => {
    it('should load job template from history', () => {
      const payload = 1;

      const response: JobTemplateModel = dummyJobTemplate;

      const action = new RevertJobTemplate(payload);
      mockActions = cold('-a', { a: action });
      const getHistoryJobTemplateResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.REVERT_JOB_TEMPLATE_SUCCESS,
          payload: response,
        },
      });

      jobTemplateService.getJobTemplateFromHistory.and.returnValue(getHistoryJobTemplateResponse);

      expect(underTest.jobTemplateRevert).toBeObservable(expected);
    });

    it('should display failure when service fails to load job template from history', () => {
      const toastrServiceSpyError = toastrServiceSpy.error;
      const payload = 1;

      const action = new RevertJobTemplate(payload);
      mockActions = cold('-a', { a: action });

      const getHistoryJobTemplateResponse = cold('-#|');
      jobTemplateService.getJobTemplateFromHistory.and.returnValue(getHistoryJobTemplateResponse);

      const expected = cold('--a', {
        a: {
          type: JobTemplatesActions.REVERT_JOB_TEMPLATE_FAILURE,
        },
      });
      expect(underTest.jobTemplateRevert).toBeObservable(expected);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpyError).toHaveBeenCalledWith(texts.LOAD_JOB_TEMPLATE_FAILURE_NOTIFICATION);
    });
  });
});
