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
import { ControlContainer, NgForm } from '@angular/forms';
import { UuidUtil } from '../../../../../utils/uuid/uuid.util';
import { texts } from 'src/app/constants/texts.constants';

@Component({
  selector: 'app-combobox-part',
  templateUrl: './combobox-part.component.html',
  styleUrls: ['./combobox-part.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class ComboboxPartComponent implements OnInit {
  uuid = UuidUtil.createUUID();
  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: any[];
  @Output() valueChange: EventEmitter<any[]> = new EventEmitter();
  @Input() options: Map<any, string>;
  @Input() isRequired = false;

  texts = texts;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    if (!this.options) {
      this.options = new Map();
    }
  }

  modelChanged(value: any[]) {
    this.valueChange.emit(value);
  }

  trackByFn(index, _) {
    return index;
  }
}
