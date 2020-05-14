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
import { ActivatedRoute, Router } from '@angular/router';
import { AppState, selectWorkflowState } from '../../../stores/app.reducers';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { StartWorkflowInitialization } from '../../../stores/workflows/workflows.actions';
import { workflowModes } from '../../../models/enums/workflowModes.constants';
import { absoluteRoutes } from '../../../constants/routes.constants';
import { PreviousRouteService } from '../../../services/previousRoute/previous-route.service';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss'],
})
export class WorkflowComponent implements OnInit, OnDestroy {
  loading = true;
  mode: string;
  id: number;

  workflowModes = workflowModes;
  absoluteRoutes = absoluteRoutes;

  isDetailsAccordionHidden = false;
  isSensorAccordionHidden = false;
  isJobsAccordionHidden = false;

  paramsSubscription: Subscription;
  workflowSubscription: Subscription;

  constructor(
    private store: Store<AppState>,
    private previousRouteService: PreviousRouteService,
    private router: Router,
    route: ActivatedRoute,
  ) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.store.dispatch(new StartWorkflowInitialization({ id: parameters.id, mode: parameters.mode }));
    });
  }

  ngOnInit(): void {
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.loading = state.workflowAction.loading;
      this.mode = state.workflowAction.mode;
      this.id = state.workflowAction.id;
    });
  }

  toggleDetailsAccordion() {
    this.isDetailsAccordionHidden = !this.isDetailsAccordionHidden;
  }

  toggleSensorAccordion() {
    this.isSensorAccordionHidden = !this.isSensorAccordionHidden;
  }

  toggleJobsAccordion() {
    this.isJobsAccordionHidden = !this.isJobsAccordionHidden;
  }

  cancelWorkflow() {
    !!this.previousRouteService.getPreviousUrl()
      ? this.router.navigateByUrl(this.previousRouteService.getPreviousUrl())
      : this.router.navigateByUrl(absoluteRoutes.WORKFLOWS_HOME);
  }

  ngOnDestroy(): void {
    !!this.workflowSubscription && this.workflowSubscription.unsubscribe();
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
  }
}
