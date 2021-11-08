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
import { jobTemplateFormConfigs } from '../../constants/jobTemplates.constants';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { ProjectModel } from '../../models/project.model';
import { Observable, of, throwError } from 'rxjs';
import { WorkflowJoinedModel } from '../../models/workflowJoined.model';
import {
  DynamicFormPart,
  DynamicFormPartFactory,
  DynamicFormParts,
  DynamicFormPartsFactory,
  FormPart,
  FormPartFactory,
  PartValidationFactory,
} from '../../models/workflowFormParts.model';
import { JobTemplateModel } from '../../models/jobTemplate.model';

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

  importWorkflows(zipFile: File): Observable<ProjectModel[]> {
    const formData: FormData = new FormData();
    formData.append('file', zipFile, zipFile.name);

    return this.httpClient
      .post<ProjectModel[]>(api.IMPORT_WORKFLOWS, formData, { observe: 'response' })
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

  getWorkflowDynamicFormParts(): Observable<DynamicFormParts> {
    return this.getJobTemplates().pipe(
      mergeMap((jobTemplates) => {
        const sensorParts = WorkflowService.getSensorDynamicFormParts();
        const jobParts = jobTemplates.map((jobTemplate) => {
          return WorkflowService.getJobDynamicFormPart(jobTemplate);
        });
        return of(DynamicFormPartsFactory.create(sensorParts, jobParts));
      }),
    );
  }

  getJobDynamicFormParts(): Observable<DynamicFormPart[]> {
    return of([
      DynamicFormPartFactory.create('Spark', WorkflowService.getSparkFormParts()),
      DynamicFormPartFactory.create('Shell', WorkflowService.getShellFormParts()),
    ]);
  }

  getJobTemplates(): Observable<JobTemplateModel[]> {
    return this.httpClient
      .get<JobTemplateModel[]>(api.GET_JOB_TEMPLATES, { observe: 'response' })
      .pipe(map((response) => response.body));
  }

  private static getSensorDynamicFormParts(): DynamicFormPart[] {
    return [
      DynamicFormPartFactory.create('Kafka', [
        FormPartFactory.create('Topic', 'properties.topic', 'string-field', PartValidationFactory.create(true, undefined, 1)),
        FormPartFactory.create('Kafka servers', 'properties.servers', 'set-field', PartValidationFactory.create(true, undefined, 1)),
        FormPartFactory.create(
          'Match properties',
          'properties.matchProperties',
          'key-value-field',
          PartValidationFactory.create(false, undefined, 1),
        ),
      ]),
      DynamicFormPartFactory.createWithLabel('Absa-Kafka', 'Kafka Ingestion Token', [
        FormPartFactory.create('Topic', 'properties.topic', 'string-field', PartValidationFactory.create(true, undefined, 1)),
        FormPartFactory.create('Kafka servers', 'properties.servers', 'set-field', PartValidationFactory.create(true, undefined, 1)),
        FormPartFactory.create('Ingestion token', 'properties.ingestionToken', 'guid-field', PartValidationFactory.create(true, 36, 36)),
      ]),
      DynamicFormPartFactory.create('Time', [
        FormPartFactory.create('Run at', 'properties.cronExpression', 'cron-quartz-field', PartValidationFactory.create(true)),
      ]),
      DynamicFormPartFactory.create('Recurring', []),
    ];
  }

  private static getJobDynamicFormPart(jobTemplate: JobTemplateModel): DynamicFormPart {
    if (jobTemplate.formConfig === jobTemplateFormConfigs.SPARK) {
      return this.getSparkDynamicFormParts(jobTemplate.id.toString(), jobTemplate.name);
    }
    if (jobTemplate.formConfig === jobTemplateFormConfigs.SHELL) {
      return this.getShellDynamicFormParts(jobTemplate.id.toString(), jobTemplate.name);
    }
    if (jobTemplate.formConfig === jobTemplateFormConfigs.HYPERDRIVE) {
      return this.getHyperConformanceDynamicFormParts(jobTemplate.id.toString(), jobTemplate.name);
    }
  }

  private static getSparkDynamicFormParts(templateId: string, templateName: string): DynamicFormPart {
    return DynamicFormPartFactory.createWithLabel(templateId, templateName, this.getSparkFormParts());
  }

  private static getShellDynamicFormParts(templateId: string, templateName: string): DynamicFormPart {
    return DynamicFormPartFactory.createWithLabel(templateId, templateName, this.getShellFormParts());
  }

  private static getHyperConformanceDynamicFormParts(templateId: string, templateName: string): DynamicFormPart {
    return DynamicFormPartFactory.createWithLabel(templateId, templateName, [
      FormPartFactory.create(
        'Additional jars',
        'jobParameters.additionalJars',
        'set-field',
        PartValidationFactory.create(false, undefined, 1),
      ),
      FormPartFactory.create(
        'Additional files',
        'jobParameters.additionalFiles',
        'set-field',
        PartValidationFactory.create(false, undefined, 1),
      ),
      FormPartFactory.create(
        'Additional Spark Config',
        'jobParameters.additionalSparkConfig',
        'key-value-field',
        PartValidationFactory.create(false, undefined, 1),
      ),
      FormPartFactory.create('App arguments', 'jobParameters.appArguments', 'set-field', PartValidationFactory.create(false, undefined, 1)),
    ]);
  }

  private static getSparkFormParts(): FormPart[] {
    return [
      FormPartFactory.create('Job jar', 'jobParameters.jobJar', 'string-field', PartValidationFactory.create(true, undefined, 1)),
      FormPartFactory.create('Main class', 'jobParameters.mainClass', 'string-field', PartValidationFactory.create(true, undefined, 1)),
      FormPartFactory.create(
        'Additional jars',
        'jobParameters.additionalJars',
        'set-field',
        PartValidationFactory.create(false, undefined, 1),
      ),
      FormPartFactory.create(
        'Additional files',
        'jobParameters.additionalFiles',
        'set-field',
        PartValidationFactory.create(false, undefined, 1),
      ),
      FormPartFactory.create(
        'Additional Spark Config',
        'jobParameters.additionalSparkConfig',
        'key-value-field',
        PartValidationFactory.create(false, undefined, 1),
      ),
      FormPartFactory.create('App arguments', 'jobParameters.appArguments', 'set-field', PartValidationFactory.create(false, undefined, 1)),
    ];
  }

  private static getShellFormParts(): FormPart[] {
    return [
      FormPartFactory.create('Script', 'jobParameters.scriptLocation', 'string-field', PartValidationFactory.create(true, undefined, 1)),
    ];
  }
}
