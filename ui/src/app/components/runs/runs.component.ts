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

import {AfterViewInit, Component, OnDestroy, QueryList, ViewChildren} from '@angular/core';
import {DagRunModel} from "../../models/dagRuns/dagRun.model";
import {ClrDatagridColumn, ClrDatagridStateInterface} from "@clr/angular";
import {Store} from "@ngrx/store";
import {AppState, selectRunState} from "../../stores/app.reducers";
import {GetDagRuns} from "../../stores/runs/runs.actions";
import {Subject, Subscription} from "rxjs";
import {skip} from "rxjs/operators";
import {dagRunColumns} from "../../constants/dagRunColumns.constants";
import {dagInstanceStatuses} from "../../models/enums/dagInstanceStatuses.constants";
import {ContainsFilterAttributes} from '../../models/search/containsFilterAttributes.model';
import {TableSearchRequestModel} from '../../models/search/tableSearchRequest.model';
import {StringEqualsFilterAttributes} from '../../models/search/stringEqualsFilterAttributes.model';
import {IntRangeFilterAttributes} from '../../models/search/intRangeFilterAttributes.model';
import {DateTimeRangeFilterAttributes} from '../../models/search/dateTimeRangeFilterAttributes.model';
import {SortAttributesModel} from '../../models/search/sortAttributes.model';

@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.scss']
})
export class RunsComponent implements OnDestroy, AfterViewInit {
  @ViewChildren(ClrDatagridColumn) columns: QueryList<ClrDatagridColumn>;

  runsSubscription: Subscription = null;
  page: number = 1;
  pageFrom: number = 0;
  pageSize: number = 0;
  sort: SortAttributesModel = null;

  dagRuns: DagRunModel[] = [];
  total: number = 0;
  loading: boolean = true;
  filters: any[] = [];

  dagRunColumns = dagRunColumns;
  dagInstanceStatuses = dagInstanceStatuses;

  removeFiltersSubject:Subject<any> = new Subject();

  constructor(private store: Store<AppState>) {}

  ngAfterViewInit(): void {
    this.runsSubscription = this.store.select(selectRunState).pipe(skip(1)).subscribe((state) => {
      this.dagRuns = state.dagRuns;
      this.total = state.total;
      this.loading = state.loading;
    });
  }

  ngOnDestroy(): void {
    this.runsSubscription.unsubscribe();
  }

  onClarityDgRefresh(state: ClrDatagridStateInterface) {
    this.sort = state.sort ? new SortAttributesModel(<string>state.sort.by, state.sort.reverse ? -1 : 1) : undefined;
    this.pageFrom = state.page.from < 0 ? 0 : state.page.from;
    this.pageSize = state.page.size;
    this.filters = state.filters ? state.filters : [];

    this.refresh();
  }

  refresh() {
    let searchRequestModel: TableSearchRequestModel = {
      from: this.pageFrom,
      size: this.pageSize,
      sort: this.sort,
      stringEqualsFilterAttributes: this.filters.filter(f => f instanceof StringEqualsFilterAttributes),
      containsFilterAttributes: this.filters.filter(f => f instanceof ContainsFilterAttributes),
      intRangeFilterAttributes: this.filters.filter(f => f instanceof IntRangeFilterAttributes),
      dateTimeRangeFilterAttributes: this.filters.filter(f => f instanceof DateTimeRangeFilterAttributes)
    };

    this.store.dispatch(new GetDagRuns(searchRequestModel));
  }

  clearFilters() {
    this.removeFiltersSubject.next();
  }

  clearSort() {
    !!this.sort ? this.columns.find(_ => _.field == this.sort.by).sortOrder = 0 : undefined;
  }

}
