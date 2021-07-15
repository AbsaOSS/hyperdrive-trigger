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

import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import cloneDeep from 'lodash-es/cloneDeep';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import { PartValidation, PartValidationFactory } from '../../../../../models/workflowFormParts.model';
import { UuidUtil } from '../../../../../utils/uuid/uuid.util';
import { texts } from 'src/app/constants/texts.constants';

@Component({
  selector: 'app-key-string-value-part',
  templateUrl: './key-string-value-part.component.html',
  styleUrls: ['./key-string-value-part.component.scss'],
})
export class KeyStringValuePartComponent implements OnInit {
  uiid = UuidUtil.createUUID();
  texts = texts;
  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: Record<string, any>;
  @Input() property: string;
  @Input() valueChanges: Subject<WorkflowEntryModel>;
  @Input() partValidation: PartValidation;
  partValidationSafe: PartValidation;

  mapOfValues: [string, string][] = [];

  maxFieldSize = 100;

  ngOnInit(): void {
    this.partValidationSafe = PartValidationFactory.create(
      this.partValidation?.isRequired ?? true,
      this.partValidation?.maxLength ?? Number.MAX_SAFE_INTEGER,
      this.partValidation?.minLength ?? 1,
    );

    for (const prop in this.value) {
      this.mapOfValues.push([prop, this.value[prop]]);
    }
    if (!this.mapOfValues || this.mapOfValues.length == 0) {
      this.modelChanged(this.partValidationSafe.isRequired ? [['', '']] : []);
    }
  }

  trackByFn(index, item) {
    return index;
  }

  onAdd() {
    const clonedValue: [string, string][] = cloneDeep(this.mapOfValues);
    clonedValue.push(['', '']);
    this.modelChanged(clonedValue);
  }

  onDelete(index: number) {
    const clonedValue: [string, string][] = cloneDeep(this.mapOfValues);

    this.mapOfValues.length === 1 && this.partValidationSafe.isRequired ? (clonedValue[index] = ['', '']) : clonedValue.splice(index, 1);

    this.modelChanged(clonedValue);
  }

  ngModelChanged(value: string, index: number, key: number) {
    const clonedValue: [string, string][] = cloneDeep(this.mapOfValues);
    clonedValue[index][key] = value;
    this.modelChanged(clonedValue);
  }

  modelChanged(value: [string, string][]) {
    const valueInObject = {};
    value.forEach((val) => {
      valueInObject[`${val[0]}`.toString().trim()] = val[1].trim();
    });
    this.value = valueInObject;
    this.mapOfValues = value;
    this.valueChanges.next(WorkflowEntryModelFactory.create(this.property, valueInObject));
  }
}
