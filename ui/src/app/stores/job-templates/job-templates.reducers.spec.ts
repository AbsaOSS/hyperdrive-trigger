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
  GetJobTemplateForForm,
  GetJobTemplateForFormFailure,
  SearchJobTemplates,
  SearchJobTemplatesFailure,
  SearchJobTemplatesSuccess,
  SetJobTemplateForFrom,
  SetJobTemplatePartsForFrom,
} from './job-templates.actions';
import { State, jobTemplatesReducer } from './job-templates.reducers';
import { JobTemplateModel, JobTemplateModelFactory } from '../../models/jobTemplate.model';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import { JobTemplateFormEntryModel } from '../../models/jobTemplateFormEntry.model';
import { SparkTemplateParametersModel } from '../../models/jobTemplateParameters.model';

describe('JobTemplatesReducers', () => {
  const initialState = {
    jobTemplates: [],
    total: 0,
    page: 1,
    loading: false,
    jobTemplateAction: {
      id: undefined,
      loading: true,
      jobTemplate: undefined,
      jobTemplateFormEntries: [],
    },
  } as State;

  it('should set loading to true on search job templates', () => {
    const jobTemplatesAction = new SearchJobTemplates({ from: 0, size: 0, sort: new SortAttributesModel('', 0) });

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({ ...initialState, loading: true });
  });

  it('should set job templates, total and loading to false on search job templates success', () => {
    const jobTemplate = JobTemplateModelFactory.create(
      0,
      'templateName',
      'fromConfig',
      { name: 'jobType' },
      SparkTemplateParametersModel.createEmpty(),
    );

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

  it('should set loading to true and job template on set job template for form', () => {
    const jobTemplate = JobTemplateModelFactory.create(
      0,
      'templateName',
      'fromConfig',
      { name: 'jobType' },
      SparkTemplateParametersModel.createEmpty(),
    );
    const jobTemplatesAction = new SetJobTemplateForFrom(jobTemplate);

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        jobTemplate: jobTemplate,
        loading: true,
      },
    });
  });

  it('should set loading to false, successfully loaded to true and job template form entries on set job template parts for form', () => {
    const jobTemplateFormEntries: JobTemplateFormEntryModel[] = [];

    const jobTemplatesAction = new SetJobTemplatePartsForFrom(jobTemplateFormEntries);

    const actual = jobTemplatesReducer(initialState, jobTemplatesAction);

    expect(actual).toEqual({
      ...initialState,
      jobTemplateAction: {
        ...initialState.jobTemplateAction,
        loading: false,
        jobTemplateFormEntries: jobTemplateFormEntries,
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
});
