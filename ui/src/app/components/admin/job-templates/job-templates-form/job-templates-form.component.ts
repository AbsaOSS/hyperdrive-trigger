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

import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../stores/app.reducers';
import { Router } from '@angular/router';
import { ConfirmationDialogTypes } from '../../../../constants/confirmationDialogTypes.constants';
import { texts } from '../../../../constants/texts.constants';
import { ConfirmationDialogService } from '../../../../services/confirmation-dialog/confirmation-dialog.service';
import { absoluteRoutes } from '../../../../constants/routes.constants';
import { PreviousRouteService } from '../../../../services/previousRoute/previous-route.service';
import * as deepEquals from 'fast-deep-equal';
import { JobTemplateModel } from '../../../../models/jobTemplate.model';
import { jobTemplateModes } from '../../../../models/enums/jobTemplateModes.constants';
import {
  CreateJobTemplate,
  DeleteJobTemplate,
  JobTemplateChanged,
  RemoveJobTemplateBackendValidationError,
  UpdateJobTemplate,
} from '../../../../stores/job-templates/job-templates.actions';
import { jobTypes, jobTypesMap } from 'src/app/constants/jobTypes.constants';
import { JobDefinitionParameters } from '../../../../models/jobDefinitionParameters.model';
import {
  HyperdriveTemplateParametersModel,
  JobTemplateParameters,
  ShellTemplateParametersModel,
  SparkTemplateParametersModel,
} from '../../../../models/jobTemplateParameters.model';

@Component({
  selector: 'app-job-templates-form',
  templateUrl: './job-templates-form.component.html',
  styleUrls: ['./job-templates-form.component.scss'],
})
export class JobTemplatesFormComponent implements OnDestroy {
  @ViewChild('jobTemplateForm') jobTemplateForm;
  @Input() mode: string;
  @Input() initialJobTemplate: JobTemplateModel;
  @Input() jobTemplate: JobTemplateModel;
  @Input() backendValidationErrors: string[];

  confirmationDialogServiceSubscription: Subscription = null;
  isJobTemplateInfoHidden = false;
  isJobTemplateParametersHidden = false;

  jobTemplateModes = jobTemplateModes;
  absoluteRoutes = absoluteRoutes;
  jobTypes = jobTypes;
  jobTypesMap = jobTypesMap;

  constructor(
    private store: Store<AppState>,
    private confirmationDialogService: ConfirmationDialogService,
    private previousRouteService: PreviousRouteService,
    private router: Router,
  ) {}

  createJobTemplate(): void {
    if (this.jobTemplateForm.form.valid) {
      this.confirmationDialogServiceSubscription = this.confirmationDialogService
        .confirm(
          ConfirmationDialogTypes.YesOrNo,
          texts.CREATE_JOB_TEMPLATE_CONFIRMATION_TITLE,
          texts.CREATE_JOB_TEMPLATE_CONFIRMATION_CONTENT,
        )
        .subscribe((confirmed) => {
          if (confirmed) this.store.dispatch(new CreateJobTemplate());
        });
    }
  }

  updateJobTemplate(): void {
    if (this.jobTemplateForm.form.valid) {
      this.confirmationDialogServiceSubscription = this.confirmationDialogService
        .confirm(
          ConfirmationDialogTypes.YesOrNo,
          texts.UPDATE_JOB_TEMPLATE_CONFIRMATION_TITLE,
          texts.UPDATE_JOB_TEMPLATE_CONFIRMATION_CONTENT,
        )
        .subscribe((confirmed) => {
          if (confirmed) this.store.dispatch(new UpdateJobTemplate());
        });
    }
  }

  deleteJobTemplate(id: number): void {
    this.confirmationDialogServiceSubscription = this.confirmationDialogService
      .confirm(ConfirmationDialogTypes.Delete, texts.DELETE_JOB_TEMPLATE_CONFIRMATION_TITLE, texts.DELETE_JOB_TEMPLATE_CONFIRMATION_CONTENT)
      .subscribe((confirmed) => {
        if (confirmed) this.store.dispatch(new DeleteJobTemplate(id));
      });
  }

  nameChange(name: string) {
    this.jobTemplate = { ...this.jobTemplate, name: name };
    this.store.dispatch(new JobTemplateChanged(this.jobTemplate));
  }

  jobTypeChange(jobType: string) {
    this.jobTemplate = { ...this.jobTemplate, jobParameters: this.clearJobTemplateParameters(jobType) };
    this.store.dispatch(new JobTemplateChanged(this.jobTemplate));
  }

  jobParametersChange(jobParameters: JobDefinitionParameters) {
    this.jobTemplate = { ...this.jobTemplate, jobParameters: jobParameters };
    this.store.dispatch(new JobTemplateChanged(this.jobTemplate));
  }

  private clearJobTemplateParameters(value: string): JobTemplateParameters {
    switch (value) {
      case jobTypes.HYPERDRIVE: {
        return HyperdriveTemplateParametersModel.createEmpty();
      }
      case jobTypes.SPARK: {
        return SparkTemplateParametersModel.createEmpty();
      }
      case jobTypes.SHELL: {
        return ShellTemplateParametersModel.createEmpty();
      }
    }
  }

  formHasChanged(): boolean {
    return !deepEquals(this.initialJobTemplate, this.jobTemplate);
  }

  cancel(): void {
    const previousUrl = this.previousRouteService.getPreviousUrl();
    const currentUrl = this.previousRouteService.getCurrentUrl();

    !previousUrl || previousUrl === currentUrl
      ? this.router.navigateByUrl(absoluteRoutes.JOB_TEMPLATES_HOME)
      : this.router.navigateByUrl(previousUrl);
  }

  removeBackendValidationError(index: number): void {
    this.store.dispatch(new RemoveJobTemplateBackendValidationError(index));
  }

  toggleJobTemplateInfoAccordion() {
    this.isJobTemplateInfoHidden = !this.isJobTemplateInfoHidden;
  }

  toggleJobTemplateParametersAccordion() {
    this.isJobTemplateParametersHidden = !this.isJobTemplateParametersHidden;
  }

  isReadOnlyMode(): boolean {
    return this.mode == jobTemplateModes.SHOW || this.mode == jobTemplateModes.COMPARISON;
  }

  ngOnDestroy(): void {
    !!this.confirmationDialogServiceSubscription && this.confirmationDialogServiceSubscription.unsubscribe();
  }
}
