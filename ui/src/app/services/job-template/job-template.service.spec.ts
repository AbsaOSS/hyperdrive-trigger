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

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JobTemplateService } from './job-template.service';
import { api } from '../../constants/api.constants';
import { TableSearchRequestModel } from '../../models/search/tableSearchRequest.model';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import { JobTemplateModel, JobTemplateModelFactory } from '../../models/jobTemplate.model';
import { SparkTemplateParametersModel } from '../../models/jobTemplateParameters.model';
import { HistoryModelFactory, HistoryPairModel } from '../../models/historyModel';
import { JobTemplateHistoryModel, JobTemplateHistoryModelFactory } from '../../models/jobTemplateHistoryModel';
import { WorkflowModelFactory } from '../../models/workflow.model';

describe('JobTemplateService', () => {
  let underTest: JobTemplateService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JobTemplateService],
      imports: [HttpClientTestingModule],
    });
    underTest = TestBed.inject(JobTemplateService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('searchJobTemplates() should search response with job templates', () => {
    const request: TableSearchRequestModel = new TableSearchRequestModel(1, 10);
    const response: TableSearchResponseModel<JobTemplateModel> = new TableSearchResponseModel<JobTemplateModel>([], 1);

    underTest.searchJobTemplates(request).subscribe(
      (data) => expect(data).toEqual(response),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.SEARCH_JOB_TEMPLATES);
    expect(req.request.method).toEqual('POST');
    req.flush(response);
  });

  it('getJobTemplate() should return job template', () => {
    const jobTemplate = JobTemplateModelFactory.create(1, 'name', SparkTemplateParametersModel.createEmpty());

    underTest.getJobTemplate(jobTemplate.id).subscribe(
      (data) => expect(data).toEqual(jobTemplate),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.GET_JOB_TEMPLATE + `?id=${jobTemplate.id}`);
    expect(req.request.method).toEqual('GET');
    req.flush(jobTemplate);
  });

  it('createJobTemplate() should return created jobTemplate', () => {
    const sparkJobTemplate = JobTemplateModelFactory.createEmpty();

    underTest.createJobTemplate(sparkJobTemplate).subscribe(
      (data) => expect(data).toEqual(sparkJobTemplate),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.CREATE_JOB_TEMPLATE);
    expect(req.request.method).toEqual('PUT');
    req.flush(sparkJobTemplate);
  });

  it('updateJobTemplate() should return updated jobTemplate', () => {
    const sparkJobTemplate = JobTemplateModelFactory.createEmpty();

    underTest.updateJobTemplate(sparkJobTemplate).subscribe(
      (data) => expect(data).toEqual(sparkJobTemplate),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.UPDATE_JOB_TEMPLATE);
    expect(req.request.method).toEqual('POST');
    req.flush(sparkJobTemplate);
  });

  it('deleteJobTemplate() should delete jobTemplate', () => {
    const id = 1;
    const response = true;
    underTest.deleteJobTemplate(id).subscribe(
      (data) => expect(data).toEqual(response),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.DELETE_JOB_TEMPLATE + `?id=${id}`);
    expect(req.request.method).toEqual('DELETE');
    req.flush(new Boolean(true));
  });

  it('getHistoryForJobTemplate() should return history for jobTemplate', () => {
    const jobTemplateId = 1;
    const history = HistoryModelFactory.create(2, new Date(Date.now()), 'userName', { name: 'Create' });

    underTest.getHistoryForJobTemplate(jobTemplateId).subscribe(
      (data) => expect(data).toEqual([history]),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.GET_HISTORY_FOR_JOB_TEMPLATE + `?jobTemplateId=${jobTemplateId}`);
    expect(req.request.method).toEqual('GET');
    req.flush([history]);
  });

  it('getJobTemplatesFromHistory() should return jobTemplates from history', () => {
    const leftHistoryId = 11;
    const rightHistoryId = 12;

    const history = HistoryModelFactory.create(2, new Date(Date.now()), 'userName', { name: 'Create' });

    const jobTemplateHistoriesForComparison: HistoryPairModel<JobTemplateHistoryModel> = {
      leftHistory: JobTemplateHistoryModelFactory.create(history, leftHistoryId, JobTemplateModelFactory.createEmpty()),
      rightHistory: JobTemplateHistoryModelFactory.create(history, rightHistoryId, JobTemplateModelFactory.createEmpty()),
    };

    underTest.getJobTemplatesFromHistory(leftHistoryId, rightHistoryId).subscribe(
      (data) => expect(data).toEqual(jobTemplateHistoriesForComparison),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(
      api.GET_JOB_TEMPLATES_FROM_HISTORY + `?leftJobTemplateHistoryId=${leftHistoryId}&rightJobTemplateHistoryId=${rightHistoryId}`,
    );
    expect(req.request.method).toEqual('GET');
    req.flush(jobTemplateHistoriesForComparison);
  });

  it('getJobTemplateUsage() should return all workflows where job template is used', () => {
    const workflows = [
      WorkflowModelFactory.create('workflowOne', undefined, undefined, undefined, undefined, undefined),
      WorkflowModelFactory.create('workflowTwo', undefined, undefined, undefined, undefined, undefined),
    ];
    const jobTemplateId = 1;

    underTest.getJobTemplateUsage(jobTemplateId).subscribe(
      (data) => expect(data).toEqual(workflows),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.GET_JOB_TEMPLATE_USAGE.replace('{id}', jobTemplateId.toString()));
    expect(req.request.method).toEqual('GET');
    req.flush(workflows);
  });

  it('getJobTemplateFromHistory() should return history job template', () => {
    const jobTemplate = JobTemplateModelFactory.create(1, 'name', SparkTemplateParametersModel.createEmpty());

    underTest.getJobTemplateFromHistory(jobTemplate.id).subscribe(
      (data) => expect(data).toEqual(jobTemplate),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.GET_JOB_TEMPLATE_FROM_HISTORY + `?jobTemplateHistoryId=${jobTemplate.id}`);
    expect(req.request.method).toEqual('GET');
    req.flush(jobTemplate);
  });
});
