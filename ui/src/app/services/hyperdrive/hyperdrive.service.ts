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
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IngestionStatusModel, IngestionStatusModelFactory, IngestionStatusResponseModel } from '../../models/ingestionStatus.model';
import { api } from '../../constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class HyperdriveService {
  constructor(private httpClient: HttpClient) {}

  getIngestionStatus(id: number): Observable<IngestionStatusModel[]> {
    return this.httpClient
      .get<IngestionStatusResponseModel[]>(api.GET_INGESTION_STATUS.replace('{id}', id.toString()), { observe: 'response' })
      .pipe(map((response) => response.body))
      .pipe(
        map((response) =>
          response.map((ingestionStatusResponse) => IngestionStatusModelFactory.fromIngestionStatusResponseModel(ingestionStatusResponse)),
        ),
      );
  }
}
