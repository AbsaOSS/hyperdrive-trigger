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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ShellTemplateParametersModel } from '../../../../../../models/jobTemplateParameters.model';

@Component({
  selector: 'app-shell-template',
  templateUrl: './shell-template.component.html',
  styleUrls: ['./shell-template.component.scss'],
})
export class ShellTemplateComponent {
  @Input() isShow: boolean;
  @Input() jobParameters: ShellTemplateParametersModel;
  @Output() jobParametersChange: EventEmitter<ShellTemplateParametersModel> = new EventEmitter();

  constructor() {
    // do nothing
  }

  scriptChange(scriptLocation: string) {
    this.jobParametersChange.emit({ ...this.jobParameters, scriptLocation: scriptLocation });
  }
}
