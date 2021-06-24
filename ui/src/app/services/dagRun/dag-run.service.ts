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
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { api } from '../../constants/api.constants';
import { TableSearchRequestModel } from '../../models/search/tableSearchRequest.model';
import { JobInstanceModel } from '../../models/jobInstance.model';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import { DagRunModel } from '../../models/dagRuns/dagRun.model';

@Injectable({
  providedIn: 'root',
})
export class DagRunService {
  constructor(private httpClient: HttpClient) {}

  searchDagRuns(searchRequestModel: TableSearchRequestModel): Observable<TableSearchResponseModel<DagRunModel>> {
    return this.httpClient
      .post<TableSearchResponseModel<DagRunModel>>(api.DAG_RUN_SEARCH, searchRequestModel, {
        observe: 'response',
      })
      .pipe(
        map((_) => {
          return _.body;
        }),
      );
  }

  getDagRunDetails(dagRunId: number): Observable<JobInstanceModel[]> {
    const params = new HttpParams().set('dagInstanceId', dagRunId.toString());

    return this.httpClient
      .get<JobInstanceModel[]>(api.JOB_INSTANCES, {
        params: params,
        observe: 'response',
      })
      .pipe(
        map((_) => {
          return _.body;
        }),
      );
  }

  killJob(applicationId: string): Observable<boolean> {
    return this.httpClient
      .post<boolean>(api.KILL_JOB.replace('{applicationId}', applicationId.toString()), {}, { observe: 'response' })
      .pipe(map((_) => _.body));
  }
}
