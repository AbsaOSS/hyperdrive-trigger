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
import { Subject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectJobTemplatesState } from '../../../../stores/app.reducers';
import { ActivatedRoute } from '@angular/router';
import { GetJobTemplateForForm } from '../../../../stores/job-templates/job-templates.actions';
import { WorkflowEntryModel } from '../../../../models/workflowEntry.model';
import { PartValidation, PartValidationFactory } from '../../../../models/workflowFormParts.model';
import { JobTemplateFormEntryModel } from '../../../../models/jobTemplateFormEntry.model';
import { JobTemplateModel } from '../../../../models/jobTemplate.model';
import { jobTypes } from '../../../../constants/jobTypes.constants';
import { ShellTemplateParametersModel, SparkTemplateParametersModel } from '../../../../models/jobTemplateParameters.model';

@Component({
  selector: 'app-job-template-show',
  templateUrl: './job-template-show.component.html',
  styleUrls: ['./job-template-show.component.scss'],
})
export class JobTemplateShowComponent implements OnInit, OnDestroy {
  paramsSubscription: Subscription;
  jobTemplateSubscription: Subscription = null;
  changes: Subject<WorkflowEntryModel> = new Subject<WorkflowEntryModel>();

  jobTemplate: JobTemplateModel;
  jobTemplateFormEntries: JobTemplateFormEntryModel[] = [];
  loading = false;

  isShow = true;
  partValidation: PartValidation = PartValidationFactory.create(true, 1000, 1);

  isJobTemplateInfoHidden = false;
  isJobTemplateParametersHidden = false;

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.store.dispatch(new GetJobTemplateForForm(parameters.id));
    });
  }

  ngOnInit(): void {
    this.jobTemplateSubscription = this.store.select(selectJobTemplatesState).subscribe((state) => {
      this.loading = state.jobTemplateAction.loading;
      this.jobTemplate = state.jobTemplateAction.jobTemplate;
      this.jobTemplateFormEntries = state.jobTemplateAction.jobTemplateFormEntries;
    });
  }

  toggleJobTemplateInfoAccordion() {
    this.isJobTemplateInfoHidden = !this.isJobTemplateInfoHidden;
  }

  toggleJobTemplateParametersAccordion() {
    this.isJobTemplateParametersHidden = !this.isJobTemplateParametersHidden;
  }

  isJobTemplateEmpty() {
    switch (this.jobTemplate.jobParameters.jobType) {
      case jobTypes.SHELL:
        const shellParameters: ShellTemplateParametersModel = <ShellTemplateParametersModel>this.jobTemplate.jobParameters;
        return !shellParameters.scriptLocation;
      case jobTypes.SPARK:
        const sparkParameters: SparkTemplateParametersModel = <SparkTemplateParametersModel>this.jobTemplate.jobParameters;
        return (
          !sparkParameters.jobJar &&
          !sparkParameters.mainClass &&
          (sparkParameters.appArguments?.size ?? 0) == 0 &&
          (sparkParameters.additionalJars?.size ?? 0) == 0 &&
          (sparkParameters.additionalFiles?.size ?? 0) == 0 &&
          (sparkParameters.additionalSparkConfig?.size ?? 0) == 0
        );
    }
  }

  ngOnDestroy(): void {
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
    !!this.jobTemplateSubscription && this.jobTemplateSubscription.unsubscribe();
  }
}
