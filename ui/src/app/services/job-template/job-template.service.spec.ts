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
    const jobTemplate = JobTemplateModelFactory.create(1, 'name', 'formConfig', undefined, SparkTemplateParametersModel.createEmpty());

    underTest.getJobTemplate(jobTemplate.id).subscribe(
      (data) => expect(data).toEqual(jobTemplate),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.GET_JOB_TEMPLATE + `?id=${jobTemplate.id}`);
    expect(req.request.method).toEqual('GET');
    req.flush(jobTemplate);
  });
});
