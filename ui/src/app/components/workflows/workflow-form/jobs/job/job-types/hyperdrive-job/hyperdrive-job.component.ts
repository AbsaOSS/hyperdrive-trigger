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
import {
  hyperdriveFields,
  hyperdriveTypes,
  hyperdriveTypesFields,
  hyperdriveTypesJobTemplateFields,
  hyperdriveTypesMap,
} from '../../../../../../../constants/hyperdriveTypes.constants';
import { HyperdriveTemplateParametersModel } from '../../../../../../../models/jobTemplateParameters.model';
import { HyperdriveUtil } from '../../../../../../../utils/hyperdrive/hyperdrive.util';
import { JobTemplateChangeEventModel } from '../../../../../../../models/jobTemplateChangeEvent';

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
  @Input() jobTemplateChanges: EventEmitter<JobTemplateChangeEventModel>;
  @Input() jobTemplateParameters: HyperdriveTemplateParametersModel;

  private hyperdriveType: string = undefined;

  jobTemplateChangesSubscription: Subscription;

  hyperdriveTypes = hyperdriveTypes;
  hyperdriveTypesMap = hyperdriveTypesMap;
  hyperdriveFields = hyperdriveFields;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.jobTemplateChangesSubscription = this.jobTemplateChanges.subscribe((value: JobTemplateChangeEventModel) => {
      this.jobParametersChange.emit({...HyperdriveDefinitionParametersModel.createEmpty(), jobJar: undefined, mainClass: undefined});
      if (value?.jobTemplateId) {
        const jobTemplateParameters = <HyperdriveTemplateParametersModel>value?.jobTemplateParameters;
        this.hyperdriveType = HyperdriveUtil.getHyperdriveTypeFromAppArguments(
          jobTemplateParameters.appArguments,
          hyperdriveTypesJobTemplateFields,
        );
      }
    });

    if (this.isJobTemplateSelected) {
      const hyperdriveTypeFromJobParams = HyperdriveUtil.getHyperdriveTypeFromAppArguments(
        this.jobParameters.appArguments,
        hyperdriveTypesFields,
      );
      const hyperdriveTypeFromTemplateParams = HyperdriveUtil.getHyperdriveTypeFromAppArguments(
        this.jobTemplateParameters.appArguments,
        hyperdriveTypesJobTemplateFields,
      );

      if (hyperdriveTypeFromJobParams == hyperdriveTypeFromTemplateParams) {
        this.hyperdriveType = hyperdriveTypeFromJobParams;
      } else {
        this.hyperdriveType = undefined;
      }
    } else {
      this.hyperdriveType = HyperdriveUtil.getHyperdriveTypeFromAppArguments(this.jobParameters.appArguments, hyperdriveTypesFields);
    }
  }

  getHyperdriveType(): string {
    return this.hyperdriveType;
  }

  hyperdriveTypeChange(value: string) {
    this.jobParametersChange.emit(
      {...HyperdriveDefinitionParametersModel.createEmpty(),
        jobJar: this.jobParameters.jobJar,
        mainClass: this.jobParameters.mainClass
      }
    );
    this.hyperdriveType = value;
  }

  getHyperdriveFieldValue(fieldPrefix: string): any {
    return this.jobParameters?.appArguments.find((appArgument) => appArgument.startsWith(fieldPrefix))?.replace(fieldPrefix, '');
  }

  hyperdriveFieldChange(value, fieldPrefix: string) {
    this.jobParametersChange.emit({
      ...this.jobParameters,
      appArguments: HyperdriveUtil.updateOrPushAppArgument(this.jobParameters.appArguments, fieldPrefix, value),
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

  getAppArguments(): string[] {
    const hyperdriveTypeFields = hyperdriveTypesFields.find(
      (hyperdriveTypeField) => hyperdriveTypeField.hyperdriveType == this.hyperdriveType,
    );
    return this.jobParameters?.appArguments?.filter(
      (argument) => !hyperdriveTypeFields?.fields.some((field) => argument.startsWith(field)),
    );
  }

  appArgumentsChange(appArguments: string[]) {
    const hyperdriveTypeFields = hyperdriveTypesFields.find(
      (hyperdriveTypeField) => hyperdriveTypeField.hyperdriveType == this.hyperdriveType,
    );
    const hyperdriveArguments = this.jobParameters.appArguments.filter((argument) =>
      hyperdriveTypeFields?.fields.some((field) => argument.startsWith(field)),
    );
    this.jobParametersChange.emit({ ...this.jobParameters, appArguments: [...appArguments, ...hyperdriveArguments] });
  }

  additionalSparkConfigChange(additionalSparkConfig: Map<string, string>) {
    this.jobParametersChange.emit({ ...this.jobParameters, additionalSparkConfig: additionalSparkConfig });
  }

  ngOnDestroy(): void {
    !!this.jobTemplateChangesSubscription && this.jobTemplateChangesSubscription.unsubscribe();
  }
}
