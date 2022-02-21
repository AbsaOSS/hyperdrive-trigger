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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppState, selectWorkflowState } from '../../../stores/app.reducers';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { StartWorkflowInitialization, ImportWorkflow, RevertWorkflow } from '../../../stores/workflows/workflows.actions';
import { workflowModes } from '../../../models/enums/workflowModes.constants';
import { JobTemplateModel } from '../../../models/jobTemplate.model';
import { WorkflowJoinedModel } from '../../../models/workflowJoined.model';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss'],
})
export class WorkflowComponent implements OnInit, OnDestroy {
  id: number;
  mode: string;
  loading = true;
  initialWorkflow: WorkflowJoinedModel;
  workflowForForm: WorkflowJoinedModel;
  projects: string[] = [];
  jobTemplates: JobTemplateModel[];
  backendValidationErrors: string[];

  workflowModes = workflowModes;

  paramsSubscription: Subscription;
  workflowSubscription: Subscription;

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      if (parameters.mode == this.workflowModes.IMPORT) {
        this.store.dispatch(new ImportWorkflow());
      } else if (parameters.mode == this.workflowModes.REVERT) {
        this.store.dispatch(new RevertWorkflow(parameters.id));
      } else {
        this.store.dispatch(new StartWorkflowInitialization({ id: parameters.id, mode: parameters.mode }));
      }
    });
  }

  ngOnInit(): void {
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.id = state.workflowAction.id;
      this.mode = state.workflowAction.mode;
      this.loading = state.workflowAction.loading;
      this.initialWorkflow = state.workflowAction.workflow;
      this.workflowForForm = state.workflowAction.workflowForForm;
      this.projects = state.projects.map((project) => project.name);
      this.jobTemplates = state.jobTemplates;
      this.backendValidationErrors = state.workflowAction.backendValidationErrors;
    });
  }

  ngOnDestroy(): void {
    !!this.workflowSubscription && this.workflowSubscription.unsubscribe();
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
  }
}
