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

@Component({
  selector: 'app-key-value-map-part',
  templateUrl: './key-value-map-part.component.html',
  styleUrls: ['./key-value-map-part.component.scss'],
})
export class KeyValueMapPartComponent implements OnInit {
  uiid = UuidUtil.createUUID();
  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: Record<string, any>;
  @Output() valueChange = new EventEmitter();
  @Input() isRequired = false;
  @Input() minLength = 1;
  @Input() maxLength: number = Number.MAX_SAFE_INTEGER;

  mapOfValues: [string, string][] = [];
  maxFieldSize = 100;

  texts = texts;

  ngOnInit(): void {
    for (const prop in this.value) {
      this.mapOfValues.push([prop, this.value[prop]]);
    }
    if (!this.mapOfValues || this.mapOfValues.length == 0) {
      this.modelChanged(this.isRequired ? [['', '']] : []);
    }
  }

  trackByFn(index, {}) {
    return index;
  }

  onAdd() {
    const clonedValue: [string, string][] = cloneDeep(this.mapOfValues);
    clonedValue.push(['', '']);
    this.modelChanged(clonedValue);
  }

  onDelete(index: number) {
    const clonedValue: [string, string][] = cloneDeep(this.mapOfValues);

    this.mapOfValues.length === 1 && this.isRequired ? (clonedValue[index] = ['', '']) : clonedValue.splice(index, 1);

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
    this.valueChange.emit(valueInObject);
  }
}
