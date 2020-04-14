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
import {HttpClient, HttpParams} from "@angular/common/http";
import {api} from "../../constants/api.constants";
import {map} from "rxjs/operators";
import {ProjectModel} from "../../models/project.model";
import {Observable, of} from "rxjs";
import {WorkflowJoinedModel} from "../../models/workflowJoined.model";
import {ComponentModel, Property, WorkflowComponentsModel} from "../../models/workflowComponents.model";

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {

  constructor(private httpClient: HttpClient) {
  }

  getProjects(): Observable<ProjectModel[]> {
    return this.httpClient.get<ProjectModel[]>(api.GET_PROJECTS, {observe: 'response'}).pipe(
      map(_ => _.body)
    );
  }

  getWorkflow(id: number): Observable<WorkflowJoinedModel> {
    let params = new HttpParams().set('id', id.toString());

    return this.httpClient.get<WorkflowJoinedModel>(api.GET_WORKFLOW, {params: params, observe: 'response'}).pipe(
      map(response => {
        // let mp = new Map;
        // Object.keys(
        //   response.body.sensor.properties.matchProperties).forEach(k => {
        //   mp.set(k, response.body.sensor.properties.matchProperties[k])
        // });
        // response.body.sensor.properties.matchProperties = mp;
        let mp: [String, String][] = [];
        Object.keys(
          response.body.sensor.properties.matchProperties).forEach(k => {
          mp.push([k, response.body.sensor.properties.matchProperties[k]]);
          // mp.set(k, response.body.sensor.properties.matchProperties[k])
        });
        response.body.sensor.properties.matchProperties = mp;
        return response.body;
      })
    );
  }

  getWorkflowComponents(): Observable<WorkflowComponentsModel> {
    return of(new WorkflowComponentsModel(
      [
        new ComponentModel(
          'Spark', [
            new Property('string-field', 'Job jar', 'jobParameters.variables.jobJar'),
            new Property('string-field', 'Main class', 'jobParameters.variables.mainClass')
          ]
        ),
        new ComponentModel(
          'Shell', [
            new Property('string-field', 'Script location', 'jobParameters.variables.scriptLocation')
          ]
        )
      ],
      [
        new ComponentModel(
          'Kafka', [
            new Property('string-field', 'Topic', 'properties.settings.variables.topic'),
            new Property('set-field', 'Kafka servers', 'properties.settings.maps.servers'),
            new Property('key-value-field', 'Match properties', 'properties.matchProperties')
          ]
        ),
        new ComponentModel(
          'Absa-Kafka', [
            new Property('string-field', 'Topic', 'properties.settings.variables.topic'),
            new Property('set-field', 'Kafka servers', 'properties.settings.maps.servers'),
            new Property('guid-field', 'Ingestion token', 'properties.matchProperties[0][1]')
          ]
        ),
        new ComponentModel(
          'Time', [
            new Property('cron-quartz-field', 'Run at', 'properties.settings.variables.cronExpression')
          ]
        )
      ]
    ));
  }

}
