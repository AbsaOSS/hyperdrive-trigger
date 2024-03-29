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
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { api } from '../../constants/api.constants';
import { catchError, map } from 'rxjs/operators';
import { ProjectModel } from '../../models/project.model';
import { Observable, throwError } from 'rxjs';
import { WorkflowJoinedModel } from '../../models/workflowJoined.model';
import { JobTemplateModel } from '../../models/jobTemplate.model';
import { WorkflowModel } from '../../models/workflow.model';
import { TableSearchRequestModel } from '../../models/search/tableSearchRequest.model';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  constructor(private httpClient: HttpClient) {}

  getProjects(): Observable<ProjectModel[]> {
    return this.httpClient
      .get<ProjectModel[]>(api.GET_PROJECTS, { observe: 'response' })
      .pipe(map((_) => _.body));
  }

  getWorkflows(): Observable<WorkflowModel[]> {
    return this.httpClient
      .get<WorkflowModel[]>(api.GET_WORKFLOWS, { observe: 'response' })
      .pipe(map((_) => _.body));
  }

  searchWorkflows(searchRequestModel: TableSearchRequestModel): Observable<TableSearchResponseModel<WorkflowModel>> {
    return this.httpClient
      .post<TableSearchResponseModel<WorkflowModel>>(api.SEARCH_WORKFLOWS, searchRequestModel, {
        observe: 'response',
      })
      .pipe(
        map((_) => {
          return _.body;
        }),
      );
  }

  getWorkflow(id: number): Observable<WorkflowJoinedModel> {
    const params = new HttpParams().set('id', id.toString());

    return this.httpClient
      .get<WorkflowJoinedModel>(api.GET_WORKFLOW, { params: params, observe: 'response' })
      .pipe(map((response) => response.body));
  }

  deleteWorkflow(id: number): Observable<boolean> {
    const params = new HttpParams().set('id', id.toString());

    return this.httpClient
      .delete<boolean>(api.DELETE_WORKFLOW, { params: params, observe: 'response' })
      .pipe(map((_) => _.body));
  }

  switchWorkflowActiveState(id: number): Observable<boolean> {
    return this.httpClient.post<boolean>(api.SWITCH_WORKFLOW_ACTIVE_STATE.replace('{id}', id.toString()), { observe: 'response' });
  }

  updateWorkflowsIsActive(ids: number[], isActiveNewValue: boolean): Observable<boolean> {
    const params = new HttpParams().set('isActiveNewValue', isActiveNewValue.toString());
    return this.httpClient
      .post<boolean>(api.UPDATE_WORKFLOWS_IS_ACTIVE, { jobIds: ids }, { params: params, observe: 'response' })
      .pipe(map((_) => _.body));
  }

  exportWorkflows(ids: number[]): Observable<{ blob: Blob; fileName: string }> {
    const params = new HttpParams().set('jobIds', ids.toString());

    return this.httpClient.get(api.EXPORT_WORKFLOWS, { params: params, observe: 'response', responseType: 'blob' }).pipe(
      map((response: HttpResponse<Blob>) => {
        const contentDisposition = response.headers.get('content-disposition') || '';
        const matches = /filename=([^;]+)/gi.exec(contentDisposition);
        const fileName = matches[1] || `workflow`;

        return {
          blob: response.body,
          fileName: fileName,
        };
      }),
      catchError((errorResponse: HttpErrorResponse) => {
        return throwError(errorResponse.error);
      }),
    );
  }

  importWorkflow(workflowFile: File): Observable<WorkflowJoinedModel> {
    const formData: FormData = new FormData();
    formData.append('file', workflowFile, workflowFile.name);

    return this.httpClient
      .post<WorkflowJoinedModel>(api.IMPORT_WORKFLOW, formData, { observe: 'response' })
      .pipe(
        map((_) => {
          return _.body;
        }),
        catchError((errorResponse: HttpErrorResponse) => {
          return throwError(errorResponse.error);
        }),
      );
  }

  importWorkflows(zipFile: File): Observable<WorkflowModel[]> {
    const formData: FormData = new FormData();
    formData.append('file', zipFile, zipFile.name);

    return this.httpClient
      .post<WorkflowModel[]>(api.IMPORT_WORKFLOWS, formData, { observe: 'response' })
      .pipe(
        map((_) => {
          return _.body;
        }),
        catchError((errorResponse: HttpErrorResponse) => {
          return throwError(errorResponse.error);
        }),
      );
  }

  createWorkflow(workflowRequest: WorkflowJoinedModel): Observable<WorkflowJoinedModel> {
    return this.httpClient
      .put<WorkflowJoinedModel>(api.CREATE_WORKFLOW, workflowRequest, { observe: 'response' })
      .pipe(
        map((_) => {
          return _.body;
        }),
        catchError((errorResponse: HttpErrorResponse) => {
          return throwError(errorResponse.error);
        }),
      );
  }

  updateWorkflow(workflowRequest: WorkflowJoinedModel): Observable<WorkflowJoinedModel> {
    return this.httpClient
      .post<WorkflowJoinedModel>(api.UPDATE_WORKFLOW, workflowRequest, { observe: 'response' })
      .pipe(
        map((_) => {
          return _.body;
        }),
        catchError((errorResponse: HttpErrorResponse) => {
          return throwError(errorResponse.error);
        }),
      );
  }

  runWorkflowJobs(workflowId: number, jobIds: number[]): Observable<boolean> {
    const params = new HttpParams().set('workflowId', workflowId.toString());
    return this.httpClient
      .put<boolean>(api.RUN_WORKFLOWS_JOBS, { jobIds: jobIds }, { params: params, observe: 'response' })
      .pipe(map((_) => _.body));
  }

  runWorkflows(workflowIds: number[]): Observable<boolean> {
    return this.httpClient.put<boolean>(api.RUN_WORKFLOWS, { workflowIds: workflowIds }, { observe: 'response' }).pipe(
      map((_) => _.body),
      catchError((errorResponse: HttpErrorResponse) => {
        return throwError(errorResponse.error);
      }),
    );
  }

  getJobTemplates(): Observable<JobTemplateModel[]> {
    return this.httpClient
      .get<JobTemplateModel[]>(api.GET_JOB_TEMPLATES, { observe: 'response' })
      .pipe(map((response) => response.body));
  }
}
