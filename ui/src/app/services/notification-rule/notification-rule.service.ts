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
import { NotificationRuleModel } from '../../models/notificationRule.model';
import { TableSearchRequestModel } from '../../models/search/tableSearchRequest.model';
import { TableSearchResponseModel } from '../../models/search/tableSearchResponse.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationRuleService {
  constructor(private httpClient: HttpClient) {}

  createNotificationRule(notificationRule: NotificationRuleModel): Observable<NotificationRuleModel> {
    return this.httpClient
      .put<NotificationRuleModel>(api.CREATE_NOTIFICATION_RULE, notificationRule, { observe: 'response' })
      .pipe(
        map((_) => {
          return _.body;
        }),
        catchError((errorResponse: HttpErrorResponse) => {
          return throwError(errorResponse.error);
        }),
      );
  }

  getNotificationRule(id: number): Observable<NotificationRuleModel> {
    const params = new HttpParams().set('id', id.toString());

    return this.httpClient
      .get<NotificationRuleModel>(api.GET_NOTIFICATION_RULE, { params: params, observe: 'response' })
      .pipe(map((response) => response.body));
  }

  updateNotificationRule(notificationRule: NotificationRuleModel): Observable<NotificationRuleModel> {
    return this.httpClient
      .post<NotificationRuleModel>(api.UPDATE_NOTIFICATION_RULE, notificationRule, { observe: 'response' })
      .pipe(
        map((_) => {
          return _.body;
        }),
        catchError((errorResponse: HttpErrorResponse) => {
          return throwError(errorResponse.error);
        }),
      );
  }

  deleteNotificationRule(id: number): Observable<boolean> {
    const params = new HttpParams().set('id', id.toString());

    return this.httpClient
      .delete<boolean>(api.DELETE_NOTIFICATION_RULE, { params: params, observe: 'response' })
      .pipe(map((_) => _.body));
  }

  searchNotificationRules(searchRequestModel: TableSearchRequestModel): Observable<TableSearchResponseModel<NotificationRuleModel>> {
    return this.httpClient
      .post<TableSearchResponseModel<NotificationRuleModel>>(api.SEARCH_NOTIFICATION_RULES, searchRequestModel, {
        observe: 'response',
      })
      .pipe(
        map((_) => {
          return _.body;
        }),
      );
  }
}
