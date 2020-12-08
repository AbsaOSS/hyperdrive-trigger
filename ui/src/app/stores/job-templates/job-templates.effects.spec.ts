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
import { SearchJobTemplates } from './job-templates.actions';
import * as JobTemplatesActions from './job-templates.actions';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';

describe('JobTemplatesEffects', () => {
  let underTest: JobTemplatesEffects;
  let jobTemplateService: Spy<JobTemplateService>;
  let mockActions: Observable<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        JobTemplatesEffects,
        { provide: JobTemplateService, useValue: createSpyFromClass(JobTemplateService) },
        provideMockActions(() => mockActions),
      ],
      imports: [HttpClientTestingModule],
    });
    underTest = TestBed.inject(JobTemplatesEffects);
    jobTemplateService = TestBed.inject<any>(JobTemplateService);
    mockActions = TestBed.inject(Actions);
  });

  describe('jobTemplatesSearch', () => {
    it('should return job templates', () => {
      const jobTemplate = JobTemplateModelFactory.create(0, 'templateName', 'fromConfig', { name: 'jobType' });

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
});
