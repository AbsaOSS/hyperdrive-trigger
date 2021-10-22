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

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { WorkflowJoinedModel } from '../../../../models/workflowJoined.model';

@Component({
  selector: 'app-workflow-details',
  templateUrl: './workflow-details.component.html',
  styleUrls: ['./workflow-details.component.scss'],
})
export class WorkflowDetailsComponent {
  @Input() isShow: boolean;
  @Input() details: WorkflowJoinedModel;
  @Output() detailsChange = new EventEmitter();
  @Input() projects: string[];

  constructor() {
    // do nothing
  }

  nameChange(name: string) {
    this.details = { ...this.details, name: name };
    this.detailsChange.emit(this.details);
  }

  projectChange(project: string) {
    this.details = { ...this.details, project: project };
    this.detailsChange.emit(this.details);
  }

  isActiveChange(isActive: boolean) {
    this.details = { ...this.details, isActive: isActive };
    this.detailsChange.emit(this.details);
  }
}
