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

export type WorkflowFormPartsModel = {
  detailsParts: FormPart[];
  sensorSwitchPart: FormPart;
  staticJobPart: FormPart;
  jobSwitchPart: FormPart;
  dynamicParts: DynamicFormParts;
};

export type DynamicFormParts = {
  sensorDynamicParts: DynamicFormPart[];
  jobDynamicParts: DynamicFormPart[];
};

export type DynamicFormPart = {
  value: string;
  label: string;
  parts: FormPart[];
};

export type FormPart = {
  name: string;
  property: string;
  type: string;
  partValidation: PartValidation;
  options?: Map<string, string>;
};

export class WorkflowFormPartsModelFactory {
  static create(
    detailsParts: FormPart[],
    sensorSwitchPart: FormPart,
    staticJobPart: FormPart,
    jobSwitchPart: FormPart,
    dynamicParts: DynamicFormParts,
  ): WorkflowFormPartsModel {
    return {
      detailsParts: detailsParts,
      sensorSwitchPart: sensorSwitchPart,
      staticJobPart: staticJobPart,
      jobSwitchPart: jobSwitchPart,
      dynamicParts: dynamicParts,
    };
  }
}

export class DynamicFormPartsFactory {
  static create(sensorDynamicParts: DynamicFormPart[], jobDynamicParts: DynamicFormPart[]): DynamicFormParts {
    return { sensorDynamicParts: sensorDynamicParts, jobDynamicParts: jobDynamicParts };
  }
}

export class DynamicFormPartFactory {
  static create(name: string, parts: FormPart[]): DynamicFormPart {
    return { value: name, label: name, parts: parts };
  }

  static createWithLabel(value: string, label: string, parts: FormPart[]): DynamicFormPart {
    return { value: value, label: label, parts: parts };
  }
}

export class FormPartFactory {
  static create(name: string, property: string, type: string, partValidation: PartValidation, options?: Map<string, string>): FormPart {
    return { name: name, property: property, type: type, partValidation: partValidation, options: options };
  }
}

export type PartValidation = {
  isRequired: boolean;
  maxLength?: number;
  minLength?: number;
};

export class PartValidationFactory {
  static create(isRequired: boolean, maxLength?: number, minLength?: number): PartValidation {
    return {
      isRequired: isRequired,
      maxLength: maxLength,
      minLength: minLength,
    };
  }
}
