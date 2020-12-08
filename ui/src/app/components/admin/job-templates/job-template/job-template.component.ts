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
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectJobTemplatesState } from '../../../../stores/app.reducers';
import { StartJobTemplateInitialization } from '../../../../stores/job-templates/job-templates.actions';

@Component({
  selector: 'app-job-template',
  templateUrl: './job-template.component.html',
  styleUrls: ['./job-template.component.scss'],
})
export class JobTemplateComponent implements OnInit, OnDestroy {
  paramsSubscription: Subscription;
  jobTemplateSubscription: Subscription;

  loading = true;
  mode: string;
  id: number;

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.store.dispatch(new StartJobTemplateInitialization({ id: parameters.id, mode: parameters.mode }));
    });
  }

  ngOnInit(): void {
    this.jobTemplateSubscription = this.store.select(selectJobTemplatesState).subscribe((state) => {
      this.loading = state.jobTemplateAction.loading;
      this.mode = state.jobTemplateAction.mode;
      this.id = state.jobTemplateAction.id;
    });
  }

  ngOnDestroy(): void {
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
    !!this.jobTemplateSubscription && this.jobTemplateSubscription.unsubscribe();
  }
}
