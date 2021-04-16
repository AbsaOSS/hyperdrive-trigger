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

import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { FormPart } from '../../../../models/workflowFormParts.model';
import { WorkflowEntryModel } from '../../../../models/workflowEntry.model';

@Component({
  selector: 'app-dynamic-parts',
  templateUrl: './dynamic-parts.component.html',
  styleUrls: ['./dynamic-parts.component.scss'],
})
export class DynamicPartsComponent {
  @Input() isShow: boolean;
  @Input() formParts: FormPart[];
  @Input() values: WorkflowEntryModel[];
  @Input() valueChanges: Subject<WorkflowEntryModel>;
  @Input() projects: string[];

  constructor() {
    // do nothing
  }

  getValue(path: string): any {
    const valueOption = this.values.find((value) => {
      return value.property == path;
    });
    return !!valueOption ? valueOption.value : undefined;
  }
}
