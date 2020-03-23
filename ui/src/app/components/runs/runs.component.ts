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

import {
  AfterViewInit,
  Component,
  OnDestroy, QueryList, ViewChild, ViewChildren
} from '@angular/core';
import {DagRunModel} from "../../models/dagRuns/dagRun.model";
import {ClrDatagridColumn, ClrDatagridStateInterface} from "@clr/angular";
import {Store} from "@ngrx/store";
import {AppState, selectRunState} from "../../stores/app.reducers";
import {GetDagRuns, RemoveFilters} from "../../stores/runs/runs.actions";
import {Subject, Subscription} from "rxjs";
import {skip} from "rxjs/operators";
import {dagRunColumns} from "../../constants/dagRunColumns.constants";
import {dagInstanceStatuses} from "../../models/enums/dagInstanceStatuses.constants";
import {
  DagRunsSearchRequestModel, FiltersModel,
  SortModel
} from "../../models/dagRuns/dagRunsSearchRequest.model";

@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.scss']
})
export class RunsComponent implements OnDestroy, AfterViewInit {
  runsSubscription: Subscription = null;
  page: number = 1;
  pageFrom: number = 0;
  pageSize: number = 0;
  sort: SortModel = null;

  dagRuns: DagRunModel[] = [];
  total: number = 0;
  loading: boolean = true;
  filters: {[prop:string]: any} = {};

  dagRunColumns = dagRunColumns;
  dagInstanceStatuses = dagInstanceStatuses;

  removeFiltersSubject:Subject<any> = new Subject();

  constructor(private store: Store<AppState>) {}

  ngAfterViewInit(): void {
    this.runsSubscription = this.store.select(selectRunState).pipe(skip(1)).subscribe((state) => {
      this.dagRuns = state.dagRuns;
      this.total = state.total;
      this.loading = state.loading;
      this.filters = state.filters;
    });
  }

  ngOnDestroy(): void {
    this.runsSubscription.unsubscribe();
  }

  onClarityDgRefresh(state: ClrDatagridStateInterface) {
    this.sort = state.sort ? new SortModel(<string>state.sort.by, state.sort.reverse ? -1 : 1) : undefined;
    this.pageFrom = state.page.from < 0 ? 0 : state.page.from;
    this.pageSize = state.page.size;

    this.refresh();
  }

  refresh() {
    let filters: FiltersModel = this.createFiltersModel(this.filters);

    let searchRequestModel: DagRunsSearchRequestModel = {
      from: this.pageFrom,
      size: this.pageSize,
      sort: this.sort,
      filters: filters
    };

    this.store.dispatch(new GetDagRuns(searchRequestModel));
  }

  createFiltersModel(filters: {[prop:string]: any}): FiltersModel {
    let filtersModel = new FiltersModel();

    let byWorkflowNameOption = this.filters[dagRunColumns.WORKFLOW_NAME];
    let byWorkflowName = byWorkflowNameOption ? byWorkflowNameOption : undefined;

    let byProjectNameOption = this.filters[dagRunColumns.PROJECT_NAME];
    let byProjectName = byProjectNameOption ? byProjectNameOption : undefined;

    filters.byWorkflowName = byWorkflowName;
    filters.byProjectName = byProjectName;

    return filtersModel;
}

  clearFilters() {
    this.removeFiltersSubject.next();
    this.store.dispatch(new RemoveFilters());
  }

}
