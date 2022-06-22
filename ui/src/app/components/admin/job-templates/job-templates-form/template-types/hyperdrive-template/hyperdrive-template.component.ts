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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HyperdriveTemplateParametersModel } from '../../../../../../models/jobTemplateParameters.model';
import { KeyValueModel } from "../../../../../../models/keyValue.model";

@Component({
  selector: 'app-hyperdrive-template',
  templateUrl: './hyperdrive-template.component.html',
  styleUrls: ['./hyperdrive-template.component.scss'],
})
export class HyperdriveTemplateComponent {
  @Input() isShow: boolean;
  @Input() jobParameters: HyperdriveTemplateParametersModel;
  @Output() jobParametersChange: EventEmitter<HyperdriveTemplateParametersModel> = new EventEmitter();

  constructor() {
    // do nothing
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

  additionalSparkConfigChange(additionalSparkConfig: KeyValueModel[]) {
    this.jobParametersChange.emit({ ...this.jobParameters, additionalSparkConfig: additionalSparkConfig });
  }
}
