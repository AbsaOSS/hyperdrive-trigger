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

import { DagRunService } from './dag-run.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JobInstanceModel } from '../../models/jobInstance.model';
import { api } from '../../constants/api.constants';

describe('DagRunService', () => {
  let underTest: DagRunService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DagRunService],
      imports: [HttpClientTestingModule],
    });
    underTest = TestBed.inject(DagRunService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('should return dag run details', () => {
    const id = 0;
    const jobInstances: JobInstanceModel[] = [];

    underTest.getDagRunDetails(id).subscribe(
      (data) => expect(data).toEqual(jobInstances),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.JOB_INSTANCES + '?dagInstanceId=' + id);
    expect(req.request.method).toEqual('GET');
    req.flush([...jobInstances]);
  });

  it('killJob() should call kill job rest api', () => {
    const applicationId = 'application_id';
    const response = true;
    underTest.killJob(applicationId).subscribe(
      (data) => expect(data).toEqual(response),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.KILL_JOB.replace('{applicationId}', applicationId.toString()));
    expect(req.request.method).toEqual('POST');
    req.flush(new Boolean(true));
  });
});
