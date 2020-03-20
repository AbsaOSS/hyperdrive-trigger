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

import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {HttpClient, HttpParams} from "@angular/common/http";
import {api} from '../../constants/api.constants';
import {DagRunsSearchResponseModel} from "../../models/dagRuns/dagRunsSearchResponse.model";
import {DagRunsSearchRequestModel} from "../../models/dagRuns/dagRunsSearchRequest.model";
import {JobInstanceModel} from "../../models/jobInstance.model";

@Injectable({
  providedIn: 'root'
})
export class DagRunService {

  constructor(private httpClient: HttpClient) { }

  searchDagRuns(dagRunsSearchRequestModel: DagRunsSearchRequestModel): Observable<DagRunsSearchResponseModel> {
    return this.httpClient.post<DagRunsSearchResponseModel>(
      api.DAG_RUN_SEARCH,
      dagRunsSearchRequestModel,
      {
        observe: 'response'
      }
    ).pipe(
      map(_ => {
        return _.body
      })
    );
  }

  getDagRunDetails(dagRunId: number): Observable<JobInstanceModel[]> {
    let params = new HttpParams().set('dagInstanceId', dagRunId.toString());

    return this.httpClient.get<JobInstanceModel[]>(
      api.JOB_INSTANCES,
      {
        params: params,
        observe: 'response'
      }
    ).pipe(
      map(_ => {
        return _.body
      })
    );
  }

}
