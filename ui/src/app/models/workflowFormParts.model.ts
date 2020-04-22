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

import {workflowFormParts} from "../constants/workflowFromParts.constants";

export class WorkflowFormPartsModel {
  constructor(
    public detailsParts: FormPart[],
    public dynamicSwitchSensorPart: FormPart,
    public staticJobPart: FormPart,
    public dynamicSwitchJobPart: FormPart,
    public dynamicParts: DynamicFormParts
  ) {}
}

export class DynamicFormParts {
  constructor(
    public sensorDynamicParts: DynamicFormPart[],
    public jobDynamicParts: DynamicFormPart[]
  ) {}
}

export class DynamicFormPart {
  constructor(
    public name: string,
    public parts: FormPart[]
  ) {}
}

export class FormPart {
  constructor(
    public name: string,
    public property: string,
    public isRequired: boolean,
    public type: string,
    public options?: string[]
  ) {}
}


