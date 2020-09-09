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

import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppState, selectWorkflowState } from '../../../stores/app.reducers';
import { Subject, Subscription } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { StartWorkflowInitialization, ImportWorkflow } from '../../../stores/workflows/workflows.actions';
import { workflowModes } from '../../../models/enums/workflowModes.constants';
import { absoluteRoutes } from '../../../constants/routes.constants';
import { PreviousRouteService } from '../../../services/previousRoute/previous-route.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog/confirmation-dialog.service';
import { WorkflowEntryModel } from '../../../models/workflowEntry.model';
import { JobEntryModel } from '../../../models/jobEntry.model';
import { WorkflowFormPartsModel } from '../../../models/workflowFormParts.model';
import { delay } from 'rxjs/operators';
import { WorkflowFormDataModel } from '../../../models/workflowFormData.model';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss'],
})
export class WorkflowComponent implements OnInit, OnDestroy {
  @ViewChild('workflowForm') workflowForm;
  @Output() jobsUnfold: EventEmitter<any> = new EventEmitter();

  loading = true;
  mode: string;
  id: number;
  isWorkflowActive: boolean;
  backendValidationErrors: string[];

  workflowModes = workflowModes;
  absoluteRoutes = absoluteRoutes;

  paramsSubscription: Subscription;
  workflowSubscription: Subscription;

  workflowData: {
    details: WorkflowEntryModel[];
    sensor: WorkflowEntryModel[];
    jobs: JobEntryModel[];
  };
  initialWorkflowData: WorkflowFormDataModel;
  workflowFormParts: WorkflowFormPartsModel;

  changes: Subject<Action> = new Subject<Action>();
  changesSubscription: Subscription;

  constructor(
    private store: Store<AppState>,
    private confirmationDialogService: ConfirmationDialogService,
    private previousRouteService: PreviousRouteService,
    private router: Router,
    route: ActivatedRoute,
  ) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      if (parameters.mode == this.workflowModes.IMPORT) {
        this.store.dispatch(new ImportWorkflow());
      } else {
        this.store.dispatch(new StartWorkflowInitialization({ id: parameters.id, mode: parameters.mode }));
      }
    });
  }

  ngOnInit(): void {
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.loading = state.workflowAction.loading;
      this.mode = state.workflowAction.mode;
      this.id = state.workflowAction.id;
      this.isWorkflowActive = !!state.workflowAction.workflow ? state.workflowAction.workflow.isActive : false;
      this.backendValidationErrors = state.workflowAction.backendValidationErrors;
      this.workflowFormParts = state.workflowAction.workflowFormParts;
      this.workflowData = state.workflowAction.workflowFormData;
      this.initialWorkflowData = state.workflowAction.initialWorkflowFormData;
    });
    this.changesSubscription = this.changes.subscribe((state) => {
      this.store.dispatch(state);
    });
  }

  ngOnDestroy(): void {
    !!this.workflowSubscription && this.workflowSubscription.unsubscribe();
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
  }
}
