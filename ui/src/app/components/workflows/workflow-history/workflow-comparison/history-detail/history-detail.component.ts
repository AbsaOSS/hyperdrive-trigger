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

import { Component, Input } from '@angular/core';
import { PartValidation, PartValidationFactory } from '../../../../../models/workflowFormParts.model';
import { Subject } from 'rxjs';
import { WorkflowEntryModel } from '../../../../../models/workflowEntry.model';
import { HistoryModel } from '../../../../../models/historyModel';

@Component({
  selector: 'app-history-detail',
  templateUrl: './history-detail.component.html',
  styleUrls: ['./history-detail.component.scss'],
})
export class HistoryDetailComponent {
  @Input() historyDetail: HistoryModel;

  isHistoryDetailHidden = false;
  partValidation: PartValidation = PartValidationFactory.create(true, 1000, 1);
  detailsChanges: Subject<WorkflowEntryModel> = new Subject<WorkflowEntryModel>();

  toggleHistoryDetailAccordion() {
    this.isHistoryDetailHidden = !this.isHistoryDetailHidden;
  }
}
