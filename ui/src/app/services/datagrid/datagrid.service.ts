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
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatagridService {
  private workflowFilter = new BehaviorSubject(undefined);
  private projectFilter = new BehaviorSubject(undefined);

  constructor() {
    // do nothing
  }

  changeWorkflowFilter(value: string) {
    this.workflowFilter.next(value);
  }

  changeProjectFilter(value: string) {
    this.projectFilter.next(value);
  }

  getWorkflowFilter(): Observable<string> {
    return this.workflowFilter.asObservable();
  }

  getProjectFilter(): Observable<string> {
    return this.projectFilter.asObservable();
  }
}
