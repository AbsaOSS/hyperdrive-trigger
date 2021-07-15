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
import { GetDagRunDetail, KillJob } from '../../../stores/runs/runs.actions';
import { Subject, Subscription } from 'rxjs';
import { AppInfoModel } from '../../../models/appInfo.model';
import { jobTypes } from '../../../constants/jobTypes.constants';
import { ToastrService } from 'ngx-toastr';
import { texts } from '../../../constants/texts.constants';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog/confirmation-dialog.service';
import { ConfirmationDialogTypes } from '../../../constants/confirmationDialogTypes.constants';

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
  confirmationDialogServiceSubscription: Subscription = null;

  jobInstances: JobInstanceModel[];
  appInfo: AppInfoModel;

  loading = true;

  jobStatuses = jobStatuses;

  constructor(
    private store: Store<AppState>,
    private toastrService: ToastrService,
    private confirmationDialogService: ConfirmationDialogService,
  ) {}

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

  getKillableJob(): JobInstanceModel {
    return this.jobInstances.find(
      (jobInstance) =>
        jobInstance.jobStatus.name == jobStatuses.RUNNING &&
        jobInstance.jobParameters.jobType.name == jobTypes.SPARK &&
        jobInstance.applicationId,
    );
  }

  canKillJob(): boolean {
    return !!this.getKillableJob();
  }

  killJob(): void {
    const jobToKill: JobInstanceModel = this.getKillableJob();
    if (!!jobToKill) {
      this.confirmationDialogServiceSubscription = this.confirmationDialogService
        .confirm(ConfirmationDialogTypes.YesOrNo, texts.KILL_JOB_CONFIRMATION_TITLE, texts.KILL_JOB_CONFIRMATION_CONTENT)
        .subscribe((confirmed) => {
          if (confirmed) {
            this.store.dispatch(new KillJob({ dagRunId: this.dagRunId, applicationId: jobToKill.applicationId }));
          }
        });
    } else {
      this.toastrService.error(texts.KILL_JOB_FAILURE_NOTIFICATION);
    }
  }

  ngOnDestroy(): void {
    !!this.runDetailSubscription && this.runDetailSubscription.unsubscribe();
    !!this.refreshSubscription && this.refreshSubscription.unsubscribe();
    !!this.applicationStateSubscription && this.applicationStateSubscription.unsubscribe();
    !!this.confirmationDialogServiceSubscription && this.confirmationDialogServiceSubscription.unsubscribe();
  }
}
