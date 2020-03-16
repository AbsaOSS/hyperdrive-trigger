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
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {HttpClient, HttpParams} from "@angular/common/http";
import {api} from '../../constants/api.constants';
import {DagRunFilterResultModel} from "../../models/dagRuns/dagRunSearchResponse.model";
import {DagRunSearchRequestModel} from "../../models/dagRuns/dagRunSearchRequest.model";
import {JobInstanceModel} from "../../models/jobInstance.model";

@Injectable({
  providedIn: 'root'
})
export class DagRunService {

  constructor(private httpClient: HttpClient) { }

  searchDagRuns(dagRunSearchRequestModel: DagRunSearchRequestModel): Observable<DagRunFilterResultModel> {
    return this.httpClient.post<DagRunFilterResultModel>(
      api.DAG_RUN_SEARCH,
      dagRunSearchRequestModel,
      {
        observe: 'response'
      }
    ).pipe(
      map( _ => {
        return _.body
      })
    );
  }

  getDagRunDetails(dagRunId: string) {
    let params = new HttpParams().set('dagInstanceId', dagRunId);

    return this.httpClient.get<JobInstanceModel[]>(
      api.JOB_INSTANCES,
      {
        params: params,
        observe: 'response'
      }
    ).pipe(
      map( _ => {
        return _.body
      })
    ).toPromise();
  }

}
