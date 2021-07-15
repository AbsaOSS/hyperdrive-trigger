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
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import { ControlContainer, NgForm } from '@angular/forms';
import { PartValidation, PartValidationFactory } from '../../../../../models/workflowFormParts.model';
import { UuidUtil } from '../../../../../utils/uuid/uuid.util';
import { texts } from 'src/app/constants/texts.constants';

@Component({
  selector: 'app-string-sequence-part',
  templateUrl: './string-sequence-part.component.html',
  styleUrls: ['./string-sequence-part.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class StringSequencePartComponent implements OnInit {
  uiid = UuidUtil.createUUID();
  texts = texts;
  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: string[];
  @Input() property: string;
  @Input() valueChanges: Subject<WorkflowEntryModel>;
  @Input() partValidation: PartValidation;
  partValidationSafe: PartValidation;

  maxFieldSize = 100;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.partValidationSafe = PartValidationFactory.create(
      this.partValidation?.isRequired ?? true,
      this.partValidation?.maxLength ?? Number.MAX_SAFE_INTEGER,
      this.partValidation?.minLength ?? 1,
    );

    if (!this.value) this.modelChanged(this.partValidationSafe.isRequired ? [''] : []);
  }

  trackByFn(index, item) {
    return index;
  }

  onDeleteValue(index: number) {
    const clonedValue = Object.assign([], this.value);
    this.value.length === 1 && this.partValidationSafe.isRequired ? (clonedValue[0] = '') : clonedValue.splice(index, 1);
    this.modelChanged(clonedValue);
  }

  onAddValue() {
    const clonedValue = Object.assign([], this.value);
    clonedValue.push('');
    this.modelChanged(clonedValue);
  }

  ngModelChanged(value: string, id: number) {
    const clonedValue = Object.assign([], this.value);
    clonedValue[id] = value;
    this.modelChanged(clonedValue);
  }

  modelChanged(value: string[]) {
    this.value = value.map((val) => val.trim());
    this.valueChanges.next(WorkflowEntryModelFactory.create(this.property, this.value));
  }
}
