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

import {Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import cloneDeep from 'lodash/cloneDeep';
import {WorkflowEntryModel} from "../../../../../models/workflowEntry.model";

@Component({
  selector: 'app-key-string-value-part',
  templateUrl: './key-string-value-part.component.html',
  styleUrls: ['./key-string-value-part.component.scss']
})
export class KeyStringValuePartComponent implements OnInit {

  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: [String, String][];
  @Input() property: string;
  @Input() valueChanges: Subject<WorkflowEntryModel>;

  ngOnInit(): void {
    if(!this.value || this.value.length == 0)
      this.modelChanged([['', '']]);
  }

  trackByFn(index, item) {
    return index;
  }

  onAdd() {
    const clonedValue: [String, String][] = cloneDeep(this.value);
    clonedValue.push(['','']);
    this.modelChanged(clonedValue);
  }

  onDelete(index: number) {
    const clonedValue: [String, String][] = cloneDeep(this.value);
    if(this.value.length === 1) {
      clonedValue[index][0] = '';
      clonedValue[index][1] = '';
    } else {
      clonedValue.splice(index, 1);
    }
    this.modelChanged(clonedValue);
  }

  ngModelChanged(value: string, index: number, key: number) {
    const clonedValue: [String, String][] = cloneDeep(this.value);
    clonedValue[index][key] = value;
    this.modelChanged(clonedValue);
  }


  modelChanged(value: [String, String][]) {
    this.value = value;
    this.valueChanges.next(new WorkflowEntryModel(this.property, value));
  }

}
