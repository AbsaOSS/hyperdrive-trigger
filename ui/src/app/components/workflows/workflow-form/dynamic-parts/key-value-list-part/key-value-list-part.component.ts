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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import cloneDeep from 'lodash-es/cloneDeep';
import { UuidUtil } from '../../../../../utils/uuid/uuid.util';
import { texts } from 'src/app/constants/texts.constants';
import { KeyValueModel, KeyValueModelFactory } from '../../../../../models/keyValue.model';

@Component({
  selector: 'app-key-value-list-part',
  templateUrl: './key-value-list-part.component.html',
  styleUrls: ['./key-value-list-part.component.scss'],
})
export class KeyValueListPartComponent implements OnInit {
  uiid = UuidUtil.createUUID();
  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: KeyValueModel[];
  @Output() valueChange = new EventEmitter();
  @Input() isRequired = false;
  @Input() minLength = 1;
  @Input() maxLength: number = Number.MAX_SAFE_INTEGER;

  maxFieldSize = 100;

  texts = texts;

  ngOnInit(): void {
    if (!this.value) {
      this.modelChanged(this.isRequired ? [KeyValueModelFactory.create('', '')] : []);
    }
  }

  trackByFn(index, _) {
    return index;
  }

  onAdd() {
    const clonedValue: KeyValueModel[] = cloneDeep(this.value);
    clonedValue.push(KeyValueModelFactory.create('', ''));
    this.modelChanged(clonedValue);
  }

  onDelete(index: number) {
    const clonedValue: KeyValueModel[] = cloneDeep(this.value);

    this.value.length === 1 && this.isRequired ? (clonedValue[index] = KeyValueModelFactory.create('', '')) : clonedValue.splice(index, 1);

    this.modelChanged(clonedValue);
  }

  ngModelChanged(value: string, index: number, isKey: boolean) {
    const clonedValue: KeyValueModel[] = cloneDeep(this.value);
    if (isKey) clonedValue[index] = KeyValueModelFactory.create(value, clonedValue[index].value);
    else clonedValue[index] = KeyValueModelFactory.create(clonedValue[index].key, value);

    this.modelChanged(clonedValue);
  }

  modelChanged(value: KeyValueModel[]) {
    this.value = value;
    this.valueChange.emit(value.map((val) => KeyValueModelFactory.create(val.key.trim(), val.value.trim())));
  }
}
