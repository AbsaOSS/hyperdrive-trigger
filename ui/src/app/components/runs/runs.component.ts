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
import {Subscription} from "rxjs";
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
  filters: {[prop:string]: any[]} = {};

  dagRunColumns = dagRunColumns;
  dagInstanceStatuses = dagInstanceStatuses;

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

    let filters:{[prop:string]: any[]} = {};
    if (state.filters) {
      for (let filter of state.filters) {
        let {property, value} = <{property: string, value: string}>filter;
        filters[property] = [value];
      }
    }
    this.filters = filters;
    this.refresh();
  }

  refresh() {
    let filters: FiltersModel = new FiltersModel();

    let byWorkflowOption = this.filters[dagRunColumns.WORKFLOW_NAME];
    let byWorkflow = byWorkflowOption ? byWorkflowOption[0] : undefined;

    let byProjectOption = this.filters[dagRunColumns.PROJECT_NAME];
    let byProject = byProjectOption ? byProjectOption[0] : undefined;
    filters.byWorkflowName = byWorkflow;
    filters.byProjectName = byProject;


    let searchRequestModel: DagRunsSearchRequestModel = {
      from: this.pageFrom,
      size: this.pageSize,
      sort: this.sort,
      filters: filters
    };

    this.store.dispatch(new GetDagRuns(searchRequestModel));
  }


  clear() {
    console.log('remove filters');
    this.store.dispatch(new RemoveFilters());
  }

}
