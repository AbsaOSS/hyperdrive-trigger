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
import {Observable} from "rxjs";
import {WorkflowJoinedModel} from "../../models/workflowJoined.model";

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {

  constructor(private httpClient: HttpClient) {}

  getProjects(): Observable<ProjectModel[]> {
    return this.httpClient.get<ProjectModel[]>(api.GET_PROJECTS, {observe: 'response'}).pipe(
      map(_ => _.body)
    );
  }

  getWorkflow(id: number): Observable<WorkflowJoinedModel> {
    let params = new HttpParams().set('id', id.toString());

    return this.httpClient.get<WorkflowJoinedModel>(api.GET_WORKFLOW, {params: params, observe: 'response'}).pipe(
      map(_ => _.body)
    );
  }

}
