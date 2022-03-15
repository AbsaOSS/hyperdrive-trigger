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

import { AfterContentChecked, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { UuidUtil } from '../../../../../utils/uuid/uuid.util';
import { texts } from 'src/app/constants/texts.constants';

@Component({
  selector: 'app-string-sequence-part',
  templateUrl: './string-sequence-part.component.html',
  styleUrls: ['./string-sequence-part.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class StringSequencePartComponent implements OnInit, OnChanges, AfterContentChecked {
  uiid = UuidUtil.createUUID();
  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: string[];
  @Output() valueChange: EventEmitter<string[]> = new EventEmitter();
  @Input() isRequired = false;
  @Input() minLength = 1;
  @Input() maxLength: number = Number.MAX_SAFE_INTEGER;
  @ViewChild('freeTextInput') freeTextInput;

  isFreeText = false;
  maxFieldSize = 100;

  texts = texts;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.setDefaultValue();
  }

  ngAfterContentChecked(): void {
    if (this.isFreeText && this.freeTextInput?.nativeElement) {
      this.freeTextInput.nativeElement.style.height = '';
      this.freeTextInput.nativeElement.style.height = this.freeTextInput.nativeElement.scrollHeight + 'px';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setDefaultValue();
  }

  trackByFn(index, item) {
    return index;
  }

  onDeleteValue(index: number) {
    const clonedValue = Object.assign([], this.value);
    this.value.length === 1 && this.isRequired ? (clonedValue[0] = '') : clonedValue.splice(index, 1);
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

  setDefaultValue() {
    if (!this.value) this.modelChanged(this.isRequired ? [''] : []);
  }

  getFreeTextInputValue(): string {
    return Object.assign([], this.value).join('\n');
  }

  freeTextInputChange(value: string): void {
    const newValue = value.split('\n');
    this.modelChanged(newValue);
  }

  modelChanged(value: string[]) {
    this.valueChange.emit(value.map((val) => val.trim()));
  }
}
