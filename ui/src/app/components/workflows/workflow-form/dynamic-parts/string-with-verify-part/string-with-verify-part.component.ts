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

import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { UuidUtil } from '../../../../../utils/uuid/uuid.util';
import { texts } from 'src/app/constants/texts.constants';

@Component({
  selector: 'app-string-with-verify-part',
  templateUrl: './string-with-verify-part.component.html',
  styleUrls: ['./string-with-verify-part.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class StringWithVerifyPartComponent implements OnInit {
  uiid = UuidUtil.createUUID();
  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: string;
  @Input() verifyButtonText: string;
  @Input() verifyCallback: (arg: string) => void;
  @Output() valueChange = new EventEmitter();
  @Input() isRequired = false;
  @Input() minLength = 1;
  @Input() maxLength: number = Number.MAX_SAFE_INTEGER;
  @Input() helperText: string;

  texts = texts;

  constructor() {
    // do nothing
  }

  modelChanged(value: string) {
    this.valueChange.emit(value.trim());
  }

  verify(): void {
    this.verifyCallback(this.value);
  }

  ngOnInit(): void {
    if (!this.value && this.isRequired) {
      this.modelChanged('');
    }
  }
}
