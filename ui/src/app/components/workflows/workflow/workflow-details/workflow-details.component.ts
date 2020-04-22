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

import {AfterViewInit, ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {workflowModes} from "../../../../models/enums/workflowModes.constants";
import {Subject, Subscription} from "rxjs";
import {distinctUntilChanged} from "rxjs/operators";
import {Store} from "@ngrx/store";
import {AppState, selectWorkflowState} from "../../../../stores/app.reducers";
import {WorkflowDetailsChanged} from "../../../../stores/workflows/workflows.actions";
import {FormPart} from "../../../../models/workflowFormParts.model";
import {WorkflowEntryModel} from "../../../../models/workflowEntry.model";

@Component({
  selector: 'app-workflow-details',
  templateUrl: './workflow-details.component.html',
  styleUrls: ['./workflow-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowDetailsComponent implements AfterViewInit, OnInit {
  mode: string;

  workflowSubscription: Subscription;

  workflowModes = workflowModes;

  detailsChanges: Subject<WorkflowEntryModel> = new Subject<WorkflowEntryModel>();
  detailsChangesSubscription: Subscription;
  parts: FormPart[];

  data: { property: string, value: any }[];

  constructor(private store: Store<AppState>) {
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.mode = state.workflowAction.mode;
      this.data = state.workflowAction.workflowData.details;
      this.parts = state.workflowFormParts.detailsParts;
    });
  }

  ngOnInit(): void {
    this.detailsChangesSubscription = this.detailsChanges.pipe(
      distinctUntilChanged()
    ).subscribe(newValue => {
      this.store.dispatch(new WorkflowDetailsChanged({property: newValue.property, value: newValue.value}));
    });
  }

  ngAfterViewInit(): void {
  }

  getValue(prop: string) {
    let val = this.data.find(xxx => {
      return xxx.property == prop;
    });
    return !!val ? val.value : undefined;
  }

}
