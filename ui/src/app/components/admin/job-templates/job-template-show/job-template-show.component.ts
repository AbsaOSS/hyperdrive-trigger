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
import { AppState, selectJobTemplatesState } from '../../../../stores/app.reducers';
import { ActivatedRoute } from '@angular/router';
import { GetJobTemplateForForm } from '../../../../stores/job-templates/job-templates.actions';
import { JobTemplateModel } from '../../../../models/jobTemplate.model';
import { jobTypes } from '../../../../constants/jobTypes.constants';

@Component({
  selector: 'app-job-template-show',
  templateUrl: './job-template-show.component.html',
  styleUrls: ['./job-template-show.component.scss'],
})
export class JobTemplateShowComponent implements OnInit, OnDestroy {
  isShow = true;
  loading = false;
  jobTemplate: JobTemplateModel;
  isJobTemplateInfoHidden = false;
  isJobTemplateParametersHidden = false;

  paramsSubscription: Subscription;
  jobTemplateSubscription: Subscription = null;

  jobTypes = jobTypes;

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.store.dispatch(new GetJobTemplateForForm(parameters.id));
    });
  }

  ngOnInit(): void {
    this.jobTemplateSubscription = this.store.select(selectJobTemplatesState).subscribe((state) => {
      this.loading = state.jobTemplateAction.loading;
      this.jobTemplate = state.jobTemplateAction.jobTemplate;
    });
  }

  toggleJobTemplateInfoAccordion() {
    this.isJobTemplateInfoHidden = !this.isJobTemplateInfoHidden;
  }

  toggleJobTemplateParametersAccordion() {
    this.isJobTemplateParametersHidden = !this.isJobTemplateParametersHidden;
  }

  ngOnDestroy(): void {
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
    !!this.jobTemplateSubscription && this.jobTemplateSubscription.unsubscribe();
  }
}
