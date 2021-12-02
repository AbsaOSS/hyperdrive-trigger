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
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { api } from '../../constants/api.constants';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { JobTemplateModel } from '../../models/jobTemplate.model';
import { TableSearchRequestModel } from '../../models/search/tableSearchRequest.model';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';
import { HistoryModel, HistoryPairModel } from '../../models/historyModel';
import { JobTemplateHistoryModel } from '../../models/jobTemplateHistoryModel';
import { WorkflowModel } from '../../models/workflow.model';

@Injectable({
  providedIn: 'root',
})
export class JobTemplateService {
  constructor(private httpClient: HttpClient) {}

  searchJobTemplates(searchRequestModel: TableSearchRequestModel): Observable<TableSearchResponseModel<JobTemplateModel>> {
    return this.httpClient
      .post<TableSearchResponseModel<JobTemplateModel>>(api.SEARCH_JOB_TEMPLATES, searchRequestModel, {
        observe: 'response',
      })
      .pipe(
        map((_) => {
          return _.body;
        }),
      );
  }

  getJobTemplate(id: number): Observable<JobTemplateModel> {
    const params = new HttpParams().set('id', id.toString());

    return this.httpClient
      .get<JobTemplateModel>(api.GET_JOB_TEMPLATE, { params: params, observe: 'response' })
      .pipe(map((response) => response.body));
  }

  createJobTemplate(jobTemplate: JobTemplateModel): Observable<JobTemplateModel> {
    return this.httpClient
      .put<JobTemplateModel>(api.CREATE_JOB_TEMPLATE, jobTemplate, { observe: 'response' })
      .pipe(
        map((_) => {
          return _.body;
        }),
        catchError((errorResponse: HttpErrorResponse) => {
          return throwError(errorResponse.error);
        }),
      );
  }

  updateJobTemplate(jobTemplate: JobTemplateModel): Observable<JobTemplateModel> {
    return this.httpClient
      .post<JobTemplateModel>(api.UPDATE_JOB_TEMPLATE, jobTemplate, { observe: 'response' })
      .pipe(
        map((_) => {
          return _.body;
        }),
        catchError((errorResponse: HttpErrorResponse) => {
          return throwError(errorResponse.error);
        }),
      );
  }

  deleteJobTemplate(id: number): Observable<boolean> {
    const params = new HttpParams().set('id', id.toString());

    return this.httpClient
      .delete<boolean>(api.DELETE_JOB_TEMPLATE, { params: params, observe: 'response' })
      .pipe(map((_) => _.body));
  }

  getHistoryForJobTemplate(jobTemplateId: number): Observable<HistoryModel[]> {
    const params = new HttpParams().set('jobTemplateId', jobTemplateId.toString());

    return this.httpClient
      .get<HistoryModel[]>(api.GET_HISTORY_FOR_JOB_TEMPLATE, { params: params, observe: 'response' })
      .pipe(map((_) => _.body));
  }

  getJobTemplatesFromHistory(leftHistoryId: number, rightHistoryId: number): Observable<HistoryPairModel<JobTemplateHistoryModel>> {
    const params = new HttpParams()
      .set('leftJobTemplateHistoryId', leftHistoryId.toString())
      .set('rightJobTemplateHistoryId', rightHistoryId.toString());

    return this.httpClient
      .get<HistoryPairModel<JobTemplateHistoryModel>>(api.GET_JOB_TEMPLATES_FROM_HISTORY, { params: params, observe: 'response' })
      .pipe(map((_) => _.body));
  }

  getJobTemplateUsage(id: number): Observable<WorkflowModel[]> {
    return this.httpClient
      .get<WorkflowModel[]>(api.GET_JOB_TEMPLATE_USAGE.replace('{id}', id.toString()), { observe: 'response' })
      .pipe(map((response) => response.body));
  }
}
