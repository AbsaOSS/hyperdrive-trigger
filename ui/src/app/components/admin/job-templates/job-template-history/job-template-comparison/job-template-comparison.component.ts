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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { AppState, selectJobTemplatesState } from '../../../../../stores/app.reducers';
import { jobTemplateModes } from 'src/app/models/enums/jobTemplateModes.constants';
import { JobTemplateHistoryModel } from '../../../../../models/jobTemplateHistoryModel';
import { LoadJobTemplatesFromHistory } from '../../../../../stores/job-templates/job-templates.actions';
import { absoluteRoutes } from '../../../../../constants/routes.constants';

@Component({
  selector: 'app-job-template-comparison',
  templateUrl: './job-template-comparison.component.html',
  styleUrls: ['./job-template-comparison.component.scss'],
})
export class JobTemplateComparisonComponent implements OnInit, OnDestroy {
  loading = true;

  leftHistory: JobTemplateHistoryModel;
  rightHistory: JobTemplateHistoryModel;

  jobTemplateModes = jobTemplateModes;
  absoluteRoutes = absoluteRoutes;

  jobTemplatesSubscription: Subscription = null;
  paramsSubscription: Subscription;

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.store.dispatch(
        new LoadJobTemplatesFromHistory({
          leftHistoryId: parameters.historyIdLeft,
          rightHistoryId: parameters.historyIdRight,
        }),
      );
    });
  }

  ngOnInit(): void {
    this.jobTemplatesSubscription = this.store.select(selectJobTemplatesState).subscribe((state) => {
      this.leftHistory = state.history.leftHistory;
      this.rightHistory = state.history.rightHistory;
      this.loading = state.history.loading;
    });
  }

  isLoadedSuccessfully(): boolean {
    return !!this.leftHistory && !!this.rightHistory;
  }

  ngOnDestroy(): void {
    !!this.jobTemplatesSubscription && this.jobTemplatesSubscription.unsubscribe();
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
  }
}
