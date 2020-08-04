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

import { Component, Input, OnDestroy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { jobStatuses } from '../../../models/enums/jobStatuses.constants';
import { JobInstanceModel } from '../../../models/jobInstance.model';
import { Store } from '@ngrx/store';
import { AppState, selectRunState } from '../../../stores/app.reducers';
import { GetDagRunDetail } from '../../../stores/runs/runs.actions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-run-detail',
  templateUrl: './run-detail.component.html',
  styleUrls: ['./run-detail.component.scss'],
})
export class RunDetailComponent implements OnInit, OnDestroy, OnChanges {
  @Input('dagRunId') dagRunId: number;
  @Input('jobStatus') jobStatus: string;
  runDetailSubscription: Subscription;

  jobInstances: JobInstanceModel[];
  loading = true;

  jobStatuses = jobStatuses;

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    this.store.dispatch(new GetDagRunDetail(this.dagRunId));

    this.runDetailSubscription = this.store.select(selectRunState).subscribe((state) => {
      this.loading = state.detail.loading;
      this.jobInstances = state.detail.jobInstances;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
   // so nothing
  }

  ngOnDestroy(): void {
    !!this.runDetailSubscription && this.runDetailSubscription.unsubscribe();
  }
}
