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

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { HyperdriveDefinitionParametersModel } from '../../../../../../../models/jobDefinitionParameters.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-hyperdrive-job',
  templateUrl: './hyperdrive-job.component.html',
  styleUrls: ['./hyperdrive-job.component.scss'],
})
export class HyperdriveJobComponent implements OnInit, OnDestroy {
  @Input() isShow: boolean;
  @Input() jobParameters: HyperdriveDefinitionParametersModel;
  @Output() jobParametersChange: EventEmitter<HyperdriveDefinitionParametersModel> = new EventEmitter();
  @Input() isJobTemplateSelected: boolean;
  @Input() jobTemplateChanges: EventEmitter<string>;

  jobTemplateChangesSubscription: Subscription;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.jobTemplateChangesSubscription = this.jobTemplateChanges.subscribe((value) => {
      if (value) {
        this.jobParametersChange.emit({ ...this.jobParameters, jobJar: undefined, mainClass: undefined });
      }
    });
  }

  jobJarChange(jobJar: string) {
    this.jobParametersChange.emit({ ...this.jobParameters, jobJar: jobJar });
  }

  mainClassChange(mainClass: string) {
    this.jobParametersChange.emit({ ...this.jobParameters, mainClass: mainClass });
  }

  additionalJarsChange(additionalJars: string[]) {
    this.jobParametersChange.emit({ ...this.jobParameters, additionalJars: additionalJars });
  }

  additionalFilesChange(additionalFiles: string[]) {
    this.jobParametersChange.emit({ ...this.jobParameters, additionalFiles: additionalFiles });
  }

  appArgumentsChange(appArguments: string[]) {
    this.jobParametersChange.emit({ ...this.jobParameters, appArguments: appArguments });
  }

  additionalSparkConfigChange(additionalSparkConfig: Map<string, string>) {
    this.jobParametersChange.emit({ ...this.jobParameters, additionalSparkConfig: additionalSparkConfig });
  }

  ngOnDestroy(): void {
    !!this.jobTemplateChangesSubscription && this.jobTemplateChangesSubscription.unsubscribe();
  }
}
