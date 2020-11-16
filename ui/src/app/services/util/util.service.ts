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
import { api } from '../../constants/api.constants';
import { map } from 'rxjs/operators';
import { QuartzExpressionDetailModel } from '../../models/quartzExpressionDetail.model';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor(private httpClient: HttpClient) {}

  getQuartzDetail(expression: string): Observable<QuartzExpressionDetailModel> {
    const params = new HttpParams().set('expression', expression);

    return this.httpClient
      .get<QuartzExpressionDetailModel>(api.GET_QUARTZ_DETAIL, { params: params, observe: 'response' })
      .pipe(map((_) => _.body));
  }

  generateBulkErrorMessage(errorMessagesGroups: { [key: string]: string[] }): string {
    let bulkErrorMessage = '<ul>';
    for (const [groupName, messages] of Object.entries(errorMessagesGroups)) {
      bulkErrorMessage += `<li>${groupName}<ul>`;
      for (const errorMessage of messages) {
        bulkErrorMessage += `<li>${errorMessage}</li>`;
      }
      bulkErrorMessage += '</ul></li>';
    }
    bulkErrorMessage += '</ul>';
    return bulkErrorMessage;
  }
}
