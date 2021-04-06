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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { jobStatuses } from '../../../models/enums/jobStatuses.constants';
import { JobInstanceModel } from '../../../models/jobInstance.model';
import { Store } from '@ngrx/store';
import { AppState, selectApplicationState, selectRunState } from '../../../stores/app.reducers';
import { GetDagRunDetail } from '../../../stores/runs/runs.actions';
import { Subject, Subscription } from 'rxjs';
import { AppInfoModel } from '../../../models/appInfo.model';

@Component({
  selector: 'app-run-detail',
  templateUrl: './run-detail.component.html',
  styleUrls: ['./run-detail.component.scss'],
})
export class RunDetailComponent implements OnInit, OnDestroy {
  @Input('dagRunId') dagRunId: number;
  @Input() refreshSubject: Subject<boolean> = new Subject<boolean>();
  runDetailSubscription: Subscription;
  refreshSubscription: Subscription;
  applicationStateSubscription: Subscription;

  jobInstances: JobInstanceModel[];
  appInfo: AppInfoModel;

  loading = true;

  jobStatuses = jobStatuses;

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    this.store.dispatch(new GetDagRunDetail(this.dagRunId));

    this.runDetailSubscription = this.store.select(selectRunState).subscribe((state) => {
      this.loading = state.detail.loading;
      this.jobInstances = state.detail.jobInstances;
    });

    this.refreshSubscription = this.refreshSubject.subscribe((response) => {
      if (response) {
        this.onRefresh();
      }
    });

    this.applicationStateSubscription = this.store.select(selectApplicationState).subscribe((state) => {
      this.appInfo = state.appInfo;
    });
  }

  onRefresh() {
    this.store.dispatch(new GetDagRunDetail(this.dagRunId));
  }

  ngOnDestroy(): void {
    !!this.runDetailSubscription && this.runDetailSubscription.unsubscribe();
    !!this.refreshSubscription && this.refreshSubscription.unsubscribe();
    !!this.applicationStateSubscription && this.applicationStateSubscription.unsubscribe();
  }

  getApplicationIdUrl(resourceManagerUrl: string, applicationId: string): string {
    let url = resourceManagerUrl;
    if (!url.endsWith('/')) {
      url += '/';
    }
    url += 'cluster/app';
    if (!applicationId.startsWith('/')) {
      url += '/';
    }
    url += applicationId;
    return url;
  }
}
