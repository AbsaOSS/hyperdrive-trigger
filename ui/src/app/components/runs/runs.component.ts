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

import { AfterViewInit, Component, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { DagRunModel } from '../../models/dagRuns/dagRun.model';
import { ClrDatagridColumn, ClrDatagridStateInterface } from '@clr/angular';
import { ClrDatagridSortOrder } from '@clr/angular';
import { Store } from '@ngrx/store';
import { AppState, selectRunState } from '../../stores/app.reducers';
import { GetDagRuns } from '../../stores/runs/runs.actions';
import { Subject, Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { dagRunColumns } from '../../constants/dagRunColumns.constants';
import { dagInstanceStatuses } from '../../models/enums/dagInstanceStatuses.constants';
import { TableSearchRequestModel } from '../../models/search/tableSearchRequest.model';
import { SortAttributesModel } from '../../models/search/sortAttributes.model';
import { ActivatedRoute } from '@angular/router';
import { JobInstanceModel } from '../../models/jobInstance.model';
import { FilterAttributes } from '../../models/search/filterAttributes.model';
import { EqualsMultipleFilterAttributes } from '../../models/search/equalsMultipleFilterAttributes.model';
import { LongFilterAttributes } from '../../models/search/longFilterAttributes.model';
import { ContainsFilterAttributes } from '../../models/search/containsFilterAttributes.model';
import { IntRangeFilterAttributes } from '../../models/search/intRangeFilterAttributes.model';
import { DateTimeRangeFilterAttributes } from '../../models/search/dateTimeRangeFilterAttributes.model';

@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.scss'],
})
export class RunsComponent implements OnDestroy, AfterViewInit {
  @ViewChildren(ClrDatagridColumn) columns: QueryList<ClrDatagridColumn>;

  runsSubscription: Subscription = null;
  paramsSubscription: Subscription = null;
  workflowId?: number;

  page = 1;
  pageFrom = 0;
  pageSize = 0;
  sort: SortAttributesModel = null;

  dagRuns: DagRunModel[] = [];
  total = 0;
  loading = true;
  filters: FilterAttributes[] = [];

  dagRunColumns = dagRunColumns;
  dagInstanceStatuses = dagInstanceStatuses;
  descSort = ClrDatagridSortOrder.DESC;

  openedDetail: JobInstanceModel = null;

  removeFiltersSubject: Subject<any> = new Subject();
  refreshSubject: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.workflowId = parameters.workflowId;
    });
  }

  ngAfterViewInit(): void {
    this.runsSubscription = this.store
      .select(selectRunState)
      .pipe(skip(1))
      .subscribe((state) => {
        this.dagRuns = state.dagRuns;
        this.total = state.total;
        this.loading = state.loading;
      });
  }

  ngOnDestroy(): void {
    !!this.runsSubscription && this.runsSubscription.unsubscribe();
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
  }

  onClarityDgRefresh(state: ClrDatagridStateInterface) {
    this.sort = state.sort ? new SortAttributesModel(state.sort.by as string, state.sort.reverse ? -1 : 1) : undefined;
    this.pageFrom = state.page.from < 0 ? 0 : state.page.from;
    this.pageSize = state.page.size;
    this.filters = state.filters ? state.filters : [];

    this.refresh();
  }

  onDetailOpenClose(event: JobInstanceModel) {
    this.openedDetail = event;
  }

  refresh() {
    if (!this.openedDetail) {
      const searchRequestModel: TableSearchRequestModel = {
        from: this.pageFrom,
        size: this.pageSize,
        sort: this.sort,
        containsFilterAttributes: this.filters
          .filter((f) => f instanceof ContainsFilterAttributes)
          .map((f) => f as ContainsFilterAttributes),
        intRangeFilterAttributes: this.filters
          .filter((f) => f instanceof IntRangeFilterAttributes)
          .map((f) => f as IntRangeFilterAttributes),
        dateTimeRangeFilterAttributes: this.filters
          .filter((f) => f instanceof DateTimeRangeFilterAttributes)
          .map((f) => f as DateTimeRangeFilterAttributes),
        longFilterAttributes: !!this.workflowId ? [new LongFilterAttributes('workflowId', this.workflowId)] : [],
        equalsMultipleFilterAttributes: this.filters
          .filter((f) => f instanceof EqualsMultipleFilterAttributes)
          .map((f) => f as EqualsMultipleFilterAttributes),
      };
      this.store.dispatch(new GetDagRuns(searchRequestModel));
    } else {
      this.refreshSubject.next(true);
    }
  }

  clearFilters() {
    this.removeFiltersSubject.next();
  }

  clearSort() {
    !!this.sort ? (this.columns.find((_) => _.field == this.sort.by).sortOrder = 0) : undefined;
  }
}
