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

import { SortAttributesModel } from '../../models/search/sortAttributes.model';
import {
  CreateJobTemplate,
  CreateJobTemplateFailure,
  CreateJobTemplateSuccess,
  DeleteJobTemplate,
  DeleteJobTemplateFailure,
  DeleteJobTemplateSuccess,
  GetJobTemplateForForm,
  GetJobTemplateForFormFailure,
  JobTemplateChanged,
  LoadHistoryForJobTemplate,
  LoadHistoryForJobTemplateFailure,
  LoadHistoryForJobTemplateSuccess,
  LoadJobTemplatesFromHistory,
  LoadJobTemplatesFromHistoryFailure,
  LoadJobTemplatesFromHistorySuccess,
  RemoveJobTemplateBackendValidationError,
  SearchJobTemplates,
  SearchJobTemplatesFailure,
  SearchJobTemplatesSuccess,
  SetEmptyJobTemplate,
  SetJobTemplateForFrom,
  UpdateJobTemplate,
  UpdateJobTemplateFailure,
  UpdateJobTemplateSuccess,
} from './job-templates.actions';
import { State, jobTemplatesReducer } from './job-templates.reducers';
import { JobTemplateModel, JobTemplateModelFactory } from '../../models/jobTemplate.model';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import {
  HyperdriveTemplateParametersModel,
  ShellTemplateParametersModel,
  SparkTemplateParametersModel,
} from '../../models/jobTemplateParameters.model';
import { HistoryModel, HistoryModelFactory } from '../../models/historyModel';
import { JobTemplateHistoryModelFactory } from '../../models/jobTemplateHistoryModel';

describe('JobTemplatesReducers', () => {
  const initialState = {
    jobTemplates: [],
    total: 0,
    page: 1,
    loading: false,
    jobTemplateAction: {
      id: undefined,
      loading: true,
      initialJobTemplate: undefined,
      jobTemplate: undefined,
      backendValidationErrors: [],
    },
    history: {
      loading: true,
      historyEntries: [],
      leftHistory: undefined,
      rightHistory: undefined,
    },
  } as State;

  it('should set loading to true on search job templates', () => {
    const jobTemplatesAction = new SearchJobTemplates({ from: 0, size: 0, sort: new SortAttributesModel('', 0) });

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({ ...initialState, loading: true });
  });

  it('should set job templates, total and loading to false on search job templates success', () => {
    const jobTemplate = JobTemplateModelFactory.create(0, 'templateName', SparkTemplateParametersModel.createEmpty());

    const jobTemplateSearchResult = new TableSearchResponseModel<JobTemplateModel>([jobTemplate], 1);
    const jobTemplatesAction = new SearchJobTemplatesSuccess({ jobTemplatesSearchResponse: jobTemplateSearchResult });

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      loading: false,
      total: jobTemplateSearchResult.total,
      jobTemplates: jobTemplateSearchResult.items,
    });
  });

  it('should set initial state with loading to false on search job templates failure', () => {
    const jobTemplatesAction = new SearchJobTemplatesFailure();

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({ ...initialState, loading: false });
  });

  it('should set loading to true and job template id on get job template for form', () => {
    const id = 999;
    const jobTemplatesAction = new GetJobTemplateForForm(id);

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        id: id,
        loading: true,
      },
    });
  });

  it('should set loading to false and job template on set job template for form', () => {
    const jobTemplate = JobTemplateModelFactory.create(0, 'templateName', SparkTemplateParametersModel.createEmpty());
    const jobTemplatesAction = new SetJobTemplateForFrom(jobTemplate);

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        initialJobTemplate: jobTemplate,
        jobTemplate: jobTemplate,
        loading: false,
      },
    });
  });

  it('should set loading and successfully loaded to false on get job template for form failure', () => {
    const jobTemplatesAction = new GetJobTemplateForFormFailure();

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        loading: false,
      },
    });
  });

  it('should update job template on get job template changed', () => {
    const jobTemplate = JobTemplateModelFactory.create(0, 'updatedJobTemplateName', SparkTemplateParametersModel.createEmpty());
    const jobTemplatesAction = new JobTemplateChanged(jobTemplate);

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        jobTemplate: jobTemplate,
      },
    });
  });

  it('should set loading to false and set empty job templates on set empty job template', () => {
    const jobTemplatesAction = new SetEmptyJobTemplate();

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        initialJobTemplate: JobTemplateModelFactory.createEmpty(),
        jobTemplate: JobTemplateModelFactory.createEmpty(),
        loading: false,
      },
    });
  });

  it('should remove the i-th backend validation error', () => {
    const jobTemplatesAction = new RemoveJobTemplateBackendValidationError(1);

    const previousState = {
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        backendValidationErrors: ['error0', 'error1', 'error2'],
      },
    };
    const actual = jobTemplatesReducer(previousState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        backendValidationErrors: ['error0', 'error2'],
        loading: false,
      },
    });
  });

  it('should set loading to true on create job template', () => {
    const jobTemplatesAction = new CreateJobTemplate();

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        loading: true,
      },
    });
  });

  it('should set loading to true on update job template', () => {
    const jobTemplatesAction = new UpdateJobTemplate();

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        loading: true,
      },
    });
  });

  it('should set loading to false and update job templates on create job template success', () => {
    const jobTemplate = JobTemplateModelFactory.create(0, 'updatedJobTemplateName', SparkTemplateParametersModel.createEmpty());
    const jobTemplatesAction = new CreateJobTemplateSuccess(jobTemplate);

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        initialJobTemplate: jobTemplate,
        jobTemplate: jobTemplate,
        loading: false,
      },
    });
  });

  it('should set loading to false and update job templates on update job template success', () => {
    const jobTemplate = JobTemplateModelFactory.create(0, 'updatedJobTemplateName', SparkTemplateParametersModel.createEmpty());
    const jobTemplatesAction = new UpdateJobTemplateSuccess(jobTemplate);

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        initialJobTemplate: jobTemplate,
        jobTemplate: jobTemplate,
        loading: false,
      },
    });
  });

  it('should set loading to false and set backend validation errors on create job template failure', () => {
    const errors = ['error0', 'error1', 'error2'];
    const jobTemplatesAction = new CreateJobTemplateFailure(errors);

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        backendValidationErrors: errors,
        loading: false,
      },
    });
  });

  it('should set loading to false and set backend validation errors on update job template failure', () => {
    const errors = ['error0', 'error1', 'error2'];
    const jobTemplatesAction = new UpdateJobTemplateFailure(errors);

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        backendValidationErrors: errors,
        loading: false,
      },
    });
  });

  it('should set loading to true and set id on delete job template', () => {
    const id = 1;
    const jobTemplatesAction = new DeleteJobTemplate(id);

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        id: id,
        loading: true,
      },
    });
  });

  it('should remove job template from job templates on delete job template success', () => {
    const templateIdToDelete = 2;
    const jobTemplate1 = JobTemplateModelFactory.create(1, 'Spark', SparkTemplateParametersModel.createEmpty());
    const jobTemplate2 = JobTemplateModelFactory.create(templateIdToDelete, 'Hyperdrive', HyperdriveTemplateParametersModel.createEmpty());
    const jobTemplate3 = JobTemplateModelFactory.create(3, 'Shell', ShellTemplateParametersModel.createEmpty());
    const jobTemplates = [jobTemplate1, jobTemplate2, jobTemplate3];
    const updatedJobTemplates = [jobTemplate1, jobTemplate3];
    const jobTemplatesAction = new DeleteJobTemplateSuccess(templateIdToDelete);

    const previousState = {
      ...initialState,
      jobTemplates: jobTemplates,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
      },
    };
    const actual = jobTemplatesReducer(previousState, jobTemplatesAction);

    expect(actual).toEqual({
      ...previousState,
      jobTemplates: updatedJobTemplates,
      jobTemplateAction: {
        ...previousState.jobTemplateAction,
        initialJobTemplate: undefined,
        jobTemplate: undefined,
        loading: false,
        id: templateIdToDelete,
      },
    });
  });

  it('should set loading to false on delete job template failure', () => {
    const jobTemplatesAction = new DeleteJobTemplateFailure();

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        loading: false,
      },
    });
  });

  it('should set loading to true on load history for job template', () => {
    const id = 1;
    const jobTemplatesAction = new LoadHistoryForJobTemplate(id);

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      history: {
        ...initialState.history,
        loading: true,
      },
    });
  });

  it('should set loading to false and set history entries on load history for job template success', () => {
    const historyEntries: HistoryModel[] = [HistoryModelFactory.create(1, new Date(Date.now()), 'userName', { name: 'Create' })];
    const jobTemplatesAction = new LoadHistoryForJobTemplateSuccess(historyEntries);

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      history: {
        ...initialState.history,
        historyEntries: historyEntries,
        loading: false,
      },
    });
  });

  it('should set loading to false on load history for job template failure', () => {
    const jobTemplatesAction = new LoadHistoryForJobTemplateFailure();

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      history: {
        ...initialState.history,
        loading: false,
      },
    });
  });

  it('should set loading to true on load job templates from history', () => {
    const leftId = 1;
    const rightId = 2;
    const jobTemplatesAction = new LoadJobTemplatesFromHistory({ leftHistoryId: leftId, rightHistoryId: rightId });

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      history: {
        ...initialState.history,
        loading: true,
      },
    });
  });

  it('should set loading to false and left and right history on load job templates from history success', () => {
    const leftHistoryId = 11;
    const rightHistoryId = 12;
    const history = HistoryModelFactory.create(2, new Date(Date.now()), 'userName', { name: 'Create' });
    const leftHistory = JobTemplateHistoryModelFactory.create(history, leftHistoryId, JobTemplateModelFactory.createEmpty());
    const rightHistory = JobTemplateHistoryModelFactory.create(history, rightHistoryId, JobTemplateModelFactory.createEmpty());

    const jobTemplatesAction = new LoadJobTemplatesFromHistorySuccess({ leftHistory: leftHistory, rightHistory: rightHistory });

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      history: {
        ...initialState.history,
        leftHistory: leftHistory,
        rightHistory: rightHistory,
        loading: false,
      },
    });
  });

  it('should set loading to false on load job templates from history failure', () => {
    const jobTemplatesAction = new LoadJobTemplatesFromHistoryFailure();

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      history: {
        ...initialState.history,
        loading: false,
      },
    });
  });
});
