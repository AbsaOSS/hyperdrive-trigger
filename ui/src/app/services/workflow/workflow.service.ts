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
import { HttpClient, HttpParams } from '@angular/common/http';
import { api } from '../../constants/api.constants';
import { map } from 'rxjs/operators';
import { ProjectModel } from '../../models/project.model';
import { Observable, of } from 'rxjs';
import { WorkflowJoinedModel } from '../../models/workflowJoined.model';
import { DynamicFormPart, DynamicFormParts, FormPart } from '../../models/workflowFormParts.model';

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

  getWorkflowDynamicFormParts(): Observable<DynamicFormParts> {
    return of(
      new DynamicFormParts(
        [
          new DynamicFormPart('Kafka', [
            new FormPart('Topic', 'properties.settings.variables.topic', true, 'string-field'),
            new FormPart('Kafka servers', 'properties.settings.maps.servers', true, 'set-field'),
            new FormPart('Match properties', 'properties.matchProperties', false, 'key-value-field'),
          ]),
          new DynamicFormPart('Absa-Kafka', [
            new FormPart('Topic', 'properties.settings.variables.topic', true, 'string-field'),
            new FormPart('Kafka servers', 'properties.settings.maps.servers', true, 'set-field'),
            new FormPart('Ingestion token', 'properties.matchProperties.ingestionToken', true, 'guid-field'),
          ]),
          new DynamicFormPart('Time', [new FormPart('Run at', 'properties.settings.variables.cronExpression', true, 'cron-quartz-field')]),
        ],
        [
          new DynamicFormPart('Spark', [
            new FormPart('Job jar', 'jobParameters.variables.jobJar', true, 'string-field'),
            new FormPart('Main class', 'jobParameters.variables.mainClass', true, 'string-field'),
            new FormPart('Deployment mode', 'jobParameters.variables.deploymentMode', true, 'select-field', ['cluster', 'client']),
            new FormPart('App arguments', 'jobParameters.maps.appArguments', false, 'set-field'),
          ]),
          new DynamicFormPart('Shell', [new FormPart('Script location', 'jobParameters.variables.scriptLocation', true, 'string-field')]),
        ],
      ),
    );
  }

  runWorkflow(id: number): Observable<boolean> {
    const params = new HttpParams().set('workflowId', id.toString());
    return this.httpClient
      .put<boolean>(api.RUN_WORKFLOW, null, { params: params, observe: 'response' })
      .pipe(map((_) => _.body));
  }
}
