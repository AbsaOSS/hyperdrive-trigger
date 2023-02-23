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
import { api } from '../../constants/api.constants';
import { HyperdriveService } from './hyperdrive.service';
import { IngestionStatusModelFactory } from '../../models/ingestionStatus.model';

describe('HyperdriveService', () => {
  let underTest: HyperdriveService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HyperdriveService],
      imports: [HttpClientTestingModule],
    });
    underTest = TestBed.inject(HyperdriveService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('getProjects() should return projects', () => {
    const ingestionStatus = [IngestionStatusModelFactory.create('jobName', 'Hyperdrive', null)];
    const id = 1;
    underTest.getIngestionStatus(id).subscribe(
      (data) => expect(data).toEqual(ingestionStatus),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.GET_INGESTION_STATUS.replace('{id}', id.toString()));
    expect(req.request.method).toEqual('GET');
    req.flush([...ingestionStatus]);
  });
});
