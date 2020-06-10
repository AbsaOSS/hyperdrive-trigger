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
import { UuidUtil } from '../../../../../utils/uuid/uuid.util';

@Component({
  selector: 'app-boolean-part',
  templateUrl: './boolean-part.component.html',
  styleUrls: ['./boolean-part.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class BooleanPartComponent implements OnInit {
  uiid = UuidUtil.createUUID();
  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: boolean;
  @Input() property: string;
  @Input() valueChanges: Subject<WorkflowEntryModel>;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    if (!this.value) {
      this.modelChanged(false);
    }
  }

  modelChanged(value: boolean) {
    this.value = value;
    this.valueChanges.next(WorkflowEntryModelFactory.create(this.property, this.value));
  }
}
