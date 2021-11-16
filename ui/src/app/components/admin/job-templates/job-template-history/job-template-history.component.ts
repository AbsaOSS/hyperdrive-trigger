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

import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { absoluteRoutes } from 'src/app/constants/routes.constants';
import { HistoryModel } from '../../../../models/historyModel';
import { AppState, selectJobTemplatesState } from '../../../../stores/app.reducers';
import { LoadHistoryForJobTemplate } from '../../../../stores/job-templates/job-templates.actions';

@Component({
  selector: 'app-job-template-history',
  templateUrl: './job-template-history.component.html',
  styleUrls: ['./job-template-history.component.scss'],
})
export class JobTemplateHistoryComponent implements OnInit {
  loading = true;
  id: number;
  jobTemplateHistory: HistoryModel[] = [];
  selected: HistoryModel[] = [];

  absoluteRoutes = absoluteRoutes;

  jobTemplatesSubscription: Subscription = null;
  paramsSubscription: Subscription;

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.id = parameters.id;
      this.store.dispatch(new LoadHistoryForJobTemplate(parameters.id));
    });
  }

  ngOnInit(): void {
    this.jobTemplatesSubscription = this.store.select(selectJobTemplatesState).subscribe((state) => {
      this.loading = state.history.loading;
      this.jobTemplateHistory = state.history.historyEntries;
    });
  }

  isSelectable(inputHistory: HistoryModel): boolean {
    const hasEmptySlotForSelect = this.selected.length < 2;
    const isAlreadySelected = this.selected.some((history: HistoryModel) => history === inputHistory);
    return hasEmptySlotForSelect || isAlreadySelected;
  }
}
