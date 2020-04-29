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
import { WorkflowEntryModel } from '../../../../../models/workflowEntry.model';

@Component({
  selector: 'app-string-sequence-part',
  templateUrl: './string-sequence-part.component.html',
  styleUrls: ['./string-sequence-part.component.scss'],
})
export class StringSequencePartComponent implements OnInit {
  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: string[];
  @Input() property: string;
  @Input() valueChanges: Subject<WorkflowEntryModel>;

  constructor() {}

  ngOnInit(): void {
    if (!this.value) this.modelChanged(['']);
  }

  trackByFn(index, item) {
    return index;
  }

  onDeleteValue(index: number) {
    const clonedValue = Object.assign([], this.value);
    this.value.length === 1 ? (clonedValue[0] = '') : clonedValue.splice(index, 1);
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
    this.value = value;
    this.valueChanges.next(new WorkflowEntryModel(this.property, this.value));
  }
}
