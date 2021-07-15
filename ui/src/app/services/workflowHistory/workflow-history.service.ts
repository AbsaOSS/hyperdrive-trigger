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
import { Observable } from 'rxjs';
import { HistoryModel, HistoryPairModel, WorkflowHistoryModel } from '../../models/historyModel';
import { api } from '../../constants/api.constants';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WorkflowHistoryService {
  constructor(private httpClient: HttpClient) {}

  getHistoryForWorkflow(workflowId: number): Observable<HistoryModel[]> {
    const params = new HttpParams().set('workflowId', workflowId.toString());

    return this.httpClient
      .get<HistoryModel[]>(api.GET_HISTORY_FOR_WORKFLOW, { params: params, observe: 'response' })
      .pipe(map((_) => _.body));
  }

  getWorkflowsFromHistory(
    leftWorkflowHistoryId: number,
    rightWorkflowHistoryId: number,
  ): Observable<HistoryPairModel<WorkflowHistoryModel>> {
    const params = new HttpParams()
      .set('leftWorkflowHistoryId', leftWorkflowHistoryId.toString())
      .set('rightWorkflowHistoryId', rightWorkflowHistoryId.toString());

    return this.httpClient
      .get<HistoryPairModel<WorkflowHistoryModel>>(api.GET_WORKFLOWS_FROM_HISTORY, { params: params, observe: 'response' })
      .pipe(map((_) => _.body));
  }
}
