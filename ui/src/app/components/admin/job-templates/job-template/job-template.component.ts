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
import { GetJobTemplateForForm, SetEmptyJobTemplate } from '../../../../stores/job-templates/job-templates.actions';
import { JobTemplateModel } from '../../../../models/jobTemplate.model';
import { jobTypes } from '../../../../constants/jobTypes.constants';
import { jobTemplateModes } from '../../../../models/enums/jobTemplateModes.constants';

@Component({
  selector: 'app-job-template',
  templateUrl: './job-template.component.html',
  styleUrls: ['./job-template.component.scss'],
})
export class JobTemplateComponent implements OnInit, OnDestroy {
  mode: string;
  loading = false;
  initialJobTemplate: JobTemplateModel;
  jobTemplate: JobTemplateModel;
  isJobTemplateParametersHidden = false;
  backendValidationErrors: string[];

  paramsSubscription: Subscription;
  jobTemplateSubscription: Subscription = null;

  jobTypes = jobTypes;

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.mode = parameters.mode;
      if (parameters.mode == jobTemplateModes.CREATE) {
        this.store.dispatch(new SetEmptyJobTemplate());
      } else if (parameters.mode == jobTemplateModes.SHOW || parameters.mode == jobTemplateModes.EDIT) {
        this.store.dispatch(new GetJobTemplateForForm(parameters.id));
      }
    });
  }

  ngOnInit(): void {
    this.jobTemplateSubscription = this.store.select(selectJobTemplatesState).subscribe((state) => {
      this.loading = state.jobTemplateAction.loading;
      this.initialJobTemplate = state.jobTemplateAction.initialJobTemplate;
      this.jobTemplate = state.jobTemplateAction.jobTemplate;
      this.backendValidationErrors = state.jobTemplateAction.backendValidationErrors;
    });
  }

  ngOnDestroy(): void {
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
    !!this.jobTemplateSubscription && this.jobTemplateSubscription.unsubscribe();
  }
}
