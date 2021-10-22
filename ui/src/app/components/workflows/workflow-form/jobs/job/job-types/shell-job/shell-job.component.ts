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

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ShellDefinitionParametersModel } from '../../../../../../../models/jobDefinitionParameters.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shell-job',
  templateUrl: './shell-job.component.html',
  styleUrls: ['./shell-job.component.scss'],
})
export class ShellJobComponent implements OnInit, OnDestroy {
  @Input() isShow: boolean;
  @Input() jobParameters: ShellDefinitionParametersModel;
  @Output() jobParametersChange = new EventEmitter();
  @Input() isJobTemplateSelected: boolean;
  @Input() jobTemplateChanges: EventEmitter<string>;

  jobTemplateChangesSubscription: Subscription;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.jobTemplateChangesSubscription = this.jobTemplateChanges.subscribe((value) => {
      if (value) {
        this.scriptChange(undefined);
      }
    });
  }

  scriptChange(scriptLocation: string) {
    this.jobParametersChange.emit({ ...this.jobParameters, scriptLocation: scriptLocation });
  }

  ngOnDestroy(): void {
    !!this.jobTemplateChangesSubscription && this.jobTemplateChangesSubscription.unsubscribe();
  }
}
