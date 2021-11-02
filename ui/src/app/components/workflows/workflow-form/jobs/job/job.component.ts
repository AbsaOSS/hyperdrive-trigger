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

import { Component, EventEmitter, Input, Output} from '@angular/core';
import { JobTemplateModel } from '../../../../../models/jobTemplate.model';
import { jobTypes, jobTypesMap } from '../../../../../constants/jobTypes.constants';
import {
  HyperdriveDefinitionParametersModel,
  JobDefinitionParameters,
  ShellDefinitionParametersModel,
  SparkDefinitionParametersModel,
} from '../../../../../models/jobDefinitionParameters.model';
import { JobDefinitionModel } from '../../../../../models/jobDefinition.model';
import { JobTemplateParameters } from '../../../../../models/jobTemplateParameters.model';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss'],
})
export class JobComponent {
  @Input() isShow: boolean;
  @Input() job: JobDefinitionModel;
  @Output() jobChange = new EventEmitter();
  @Input() jobTemplates: JobTemplateModel[];

  jobTemplateChanges: EventEmitter<{ jobTemplateId: string; jobTemplateParameters: JobTemplateParameters }> = new EventEmitter();

  jobTypesMap = jobTypesMap;
  jobTypes = jobTypes;

  constructor() {
    // do nothing
  }

  nameChange(name: string) {
    this.job = { ...this.job, name: name };
    this.jobChange.emit(this.job);
  }

  jobTypeChange(jobType: string) {
    this.job = this.clearJobParameters(jobType);
    this.jobChange.emit(this.job);
  }

  jobTemplateChange(jobTemplateId: string) {
    this.job = { ...this.job, jobTemplateId: jobTemplateId };
    this.jobChange.emit(this.job);
    this.jobTemplateChanges.emit({
      jobTemplateId: jobTemplateId,
      jobTemplateParameters: this.getSelectedJobTemplateParameters(),
    });
  }

  jobParametersChange(jobParameters: JobDefinitionParameters) {
    this.job = { ...this.job, jobParameters: jobParameters };
    this.jobChange.emit(this.job);
  }

  private clearJobParameters(value: string): JobDefinitionModel {
    switch (value) {
      case jobTypes.HYPERDRIVE: {
        return { ...this.job, jobTemplateId: undefined, jobParameters: HyperdriveDefinitionParametersModel.createEmpty() };
      }
      case jobTypes.SPARK: {
        return { ...this.job, jobTemplateId: undefined, jobParameters: SparkDefinitionParametersModel.createEmpty() };
      }
      case jobTypes.SHELL: {
        return { ...this.job, jobTemplateId: undefined, jobParameters: ShellDefinitionParametersModel.createEmpty() };
      }
    }
  }

  getJobTemplates(): Map<string, string> {
    return new Map(
      this.jobTemplates
        .filter((jobTemplate) => {
          return jobTemplate.jobParameters.jobType == this.job.jobParameters.jobType;
        })
        .map((jobTemplate) => [jobTemplate.id.toString(), jobTemplate.name]),
    );
  }

  getSelectedJobTemplateParameters(): JobTemplateParameters {
    return this.jobTemplates.find((jobTemplate) => jobTemplate.id.toString() == this.job.jobTemplateId)?.jobParameters;
  }

  isJobTemplateSelected(): boolean {
    return this.job?.jobTemplateId !== undefined && this.job?.jobTemplateId !== null;
  }
}
