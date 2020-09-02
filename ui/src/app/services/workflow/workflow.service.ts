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
import { jobTemplates } from '../../constants/jobTemplates.constants';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { ProjectModel } from '../../models/project.model';
import { combineLatest, Observable, of, throwError } from 'rxjs';
import { WorkflowJoinedModel } from '../../models/workflowJoined.model';
import {
  DynamicFormPart,
  DynamicFormPartFactory,
  DynamicFormParts,
  DynamicFormPartsFactory,
  FormPartFactory,
  PartValidationFactory,
} from '../../models/workflowFormParts.model';

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

  exportWorkflow(id: number): Observable<{ blob: Blob; fileName: string }> {
    const params = new HttpParams().set('id', id.toString());

    return this.httpClient.get(api.EXPORT_WORKFLOW, { params: params, observe: 'response', responseType: 'blob' }).pipe(
      map((response: HttpResponse<Blob>) => {
        const contentDisposition = response.headers.get('content-disposition') || '';
        const matches = /filename=([^;]+)/gi.exec(contentDisposition);
        const fileName = matches[1] || `workflow-${id}`;

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

  getWorkflowDynamicFormParts(): Observable<DynamicFormParts> {
    const shellTemplateId$ = this.getJobTemplateId(jobTemplates.SHELL_JOB);
    const sparkTemplateId$ = this.getJobTemplateId(jobTemplates.SPARK_JOB);

    return combineLatest([shellTemplateId$, sparkTemplateId$]).pipe(
      mergeMap(([shellTemplateId, sparkTemplateId]) => {
        const sensorParts = WorkflowService.getSensorDynamicFormParts();
        const jobParts = WorkflowService.getJobDynamicFormParts(sparkTemplateId?.toString(), shellTemplateId?.toString());
        return of(DynamicFormPartsFactory.create(sensorParts, jobParts));
      }),
    );
  }

  private getJobTemplateId(name: string): Observable<number> {
    const params = new HttpParams().set('name', name);
    return this.httpClient
      .get<number>(api.GET_JOB_TEMPLATE_ID, { params: params, observe: 'response' })
      .pipe(map((response) => response.body));
  }

  private static getSensorDynamicFormParts(): DynamicFormPart[] {
    return [
      DynamicFormPartFactory.create('Kafka', [
        FormPartFactory.create(
          'Topic',
          'properties.settings.variables.topic',
          'string-field',
          PartValidationFactory.create(true, undefined, 1),
        ),
        FormPartFactory.create(
          'Kafka servers',
          'properties.settings.maps.servers',
          'set-field',
          PartValidationFactory.create(true, undefined, 1),
        ),
        FormPartFactory.create(
          'Match properties',
          'properties.matchProperties',
          'key-value-field',
          PartValidationFactory.create(false, undefined, 1),
        ),
      ]),
      DynamicFormPartFactory.create('Absa-Kafka', [
        FormPartFactory.create(
          'Topic',
          'properties.settings.variables.topic',
          'string-field',
          PartValidationFactory.create(true, undefined, 1),
        ),
        FormPartFactory.create(
          'Kafka servers',
          'properties.settings.maps.servers',
          'set-field',
          PartValidationFactory.create(true, undefined, 1),
        ),
        FormPartFactory.create(
          'Ingestion token',
          'properties.matchProperties.ingestionToken',
          'guid-field',
          PartValidationFactory.create(true, 36, 36),
        ),
      ]),
      DynamicFormPartFactory.create('Time', [
        FormPartFactory.create(
          'Run at',
          'properties.settings.variables.cronExpression',
          'cron-quartz-field',
          PartValidationFactory.create(true),
        ),
      ]),
    ];
  }

  private static getJobDynamicFormParts(sparkTemplateId: string, shellTemplateId: string): DynamicFormPart[] {
    const jobDynamicFormParts = [];
    if (sparkTemplateId != null) {
      jobDynamicFormParts.push(this.getSparkDynamicFormParts(sparkTemplateId));
    }
    if (shellTemplateId != null) {
      jobDynamicFormParts.push(this.getShellDynamicFormParts(shellTemplateId));
    }
    return jobDynamicFormParts;
  }

  private static getSparkDynamicFormParts(sparkTemplateId: string): DynamicFormPart {
    return DynamicFormPartFactory.createWithLabel(sparkTemplateId, jobTemplates.SPARK_JOB, [
      FormPartFactory.create('Job jar', 'jobParameters.variables.jobJar', 'string-field', PartValidationFactory.create(true, undefined, 1)),
      FormPartFactory.create(
        'Main class',
        'jobParameters.variables.mainClass',
        'string-field',
        PartValidationFactory.create(true, undefined, 1),
      ),
      FormPartFactory.create(
        'Deployment mode',
        'jobParameters.variables.deploymentMode',
        'select-field',
        PartValidationFactory.create(true),
        new Map([
          ['cluster', 'cluster'],
          ['client', 'client'],
        ]),
      ),
      FormPartFactory.create(
        'Additional jars',
        'jobParameters.maps.additionalJars',
        'set-field',
        PartValidationFactory.create(false, undefined, 1),
      ),
      FormPartFactory.create(
        'Additional files',
        'jobParameters.maps.additionalFiles',
        'set-field',
        PartValidationFactory.create(false, undefined, 1),
      ),
      FormPartFactory.create(
        'Additional Spark Config',
        'jobParameters.keyValuePairs.additionalSparkConfig',
        'key-value-field',
        PartValidationFactory.create(false, undefined, 1),
      ),
      FormPartFactory.create(
        'App arguments',
        'jobParameters.maps.appArguments',
        'set-field',
        PartValidationFactory.create(false, undefined, 1),
      ),
    ]);
  }

  private static getShellDynamicFormParts(shellTemplateId: string): DynamicFormPart {
    return DynamicFormPartFactory.createWithLabel(shellTemplateId, jobTemplates.SHELL_JOB, [
      FormPartFactory.create(
        'Script location',
        'jobParameters.variables.scriptLocation',
        'string-field',
        PartValidationFactory.create(true, undefined, 1),
      ),
    ]);
  }
}
