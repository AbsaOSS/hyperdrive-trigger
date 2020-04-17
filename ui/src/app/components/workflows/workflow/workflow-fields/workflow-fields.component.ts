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
import {ComponentModel} from "../../../../models/workflowComponents.model";
import {workflowModes} from "../../../../models/enums/workflowModes.constants";
import {Subject} from "rxjs";
import get from 'lodash/get';

@Component({
  selector: 'app-workflow-fields',
  templateUrl: './workflow-fields.component.html',
  styleUrls: ['./workflow-fields.component.scss']
})
export class WorkflowFieldsComponent implements OnInit {

  @Input() isShow: boolean;
  @Input() mode: string;
  @Input() workflowComponent: ComponentModel;
  @Input() modelChanges: Subject<{property: string, value: any}>;
  @Input() value: any;

  workflowModes = workflowModes;

  constructor() { }

  ngOnInit(): void {
    console.log('MutherFucking ngOnInit');
  }

  getValue(path: string): any {
    return get(this.value, path);
  }

}
