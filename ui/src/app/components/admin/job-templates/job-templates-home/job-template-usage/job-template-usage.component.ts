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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, Subscription } from 'rxjs';
import { WorkflowModel } from '../../../../../models/workflow.model';
import { AppState, selectJobTemplatesState } from '../../../../../stores/app.reducers';
import { GetJobTemplateUsage } from '../../../../../stores/job-templates/job-templates.actions';
import { Router } from "@angular/router";
import { absoluteRoutes } from "../../../../../constants/routes.constants";

@Component({
  selector: 'app-job-template-usage',
  templateUrl: './job-template-usage.component.html',
  styleUrls: ['./job-template-usage.component.scss'],
})
export class JobTemplateUsageComponent implements OnInit, OnDestroy {
  @Input('jobTemplateId') jobTemplateId: number;
  @Input() refreshSubject: Subject<boolean> = new Subject<boolean>();
  workflows: WorkflowModel[];
  loading = true;

  templatesSubscription: Subscription;
  refreshSubscription: Subscription;

  constructor(private store: Store<AppState>, private router: Router) {}

  ngOnInit() {
    this.store.dispatch(new GetJobTemplateUsage(this.jobTemplateId));

    this.templatesSubscription = this.store.select(selectJobTemplatesState).subscribe((state) => {
      this.loading = state.usage.loading;
      this.workflows = state.usage.workflows;
    });

    this.refreshSubscription = this.refreshSubject.subscribe((response) => {
      if (response) {
        this.onRefresh();
      }
    });
  }

  onRefresh() {
    this.store.dispatch(new GetJobTemplateUsage(this.jobTemplateId));
  }

  showWorkflow(id: number) {
    this.router.navigate([absoluteRoutes.SHOW_WORKFLOW, id]);
  }

  ngOnDestroy(): void {
    !!this.templatesSubscription && this.templatesSubscription.unsubscribe();
    !!this.refreshSubscription && this.refreshSubscription.unsubscribe();
  }
}
