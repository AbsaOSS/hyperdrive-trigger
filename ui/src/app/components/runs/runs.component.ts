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
  OnDestroy
} from '@angular/core';
import {DagRunModel} from "../../models/dagRun.model";
import {ClrDatagridStateInterface} from "@clr/angular";
import {Store} from "@ngrx/store";
import {AppState, selectRunState} from "../../stores/app.reducers";
import {GetDagRuns} from "../../stores/runs/runs.actions";
import {Subscription} from "rxjs";
import {skip} from "rxjs/operators";
import {Filter, Sort} from "../../models/dagRunSearch.model";
import {dagRunColumns} from "../../constants/dagRunColumns.constants";
import {dagRunStatuses} from "../../constants/dagRunStatuses.constants";

@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.scss']
})
export class RunsComponent implements OnDestroy, AfterViewInit {
  runsSubscription: Subscription = null;
  dagRuns: DagRunModel[] = [];
  total: number = 0;
  loading: boolean = true;
  page: number = 1;

  dagRunColumns = dagRunColumns;
  dagRunStatuses = dagRunStatuses;

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
    let sort: Sort = state.sort ? new Sort(<string>state.sort.by, state.sort.reverse ? -1 : 1) : null;
    let filters: Filter[] = state.filters ? state.filters.map(filter => <Filter> filter) : [];

    let pageFrom = state.page.from < 0 ? 0 : state.page.from;
    let pageSize = state.page.size;

    this.store.dispatch(new GetDagRuns({
      pageFrom: pageFrom,
      pageSize: pageSize,
      sort: sort,
      filters: filters,
    }));
  }

}
