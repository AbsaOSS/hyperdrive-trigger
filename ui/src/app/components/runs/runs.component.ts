import {AfterViewInit, Component, Input, OnDestroy, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {DagRunModel} from "../../models/dagRun.model";
import {ClrDatagrid, ClrDatagridColumn, ClrDatagridSortOrder, ClrDatagridStateInterface} from "@clr/angular";
import {Store} from "@ngrx/store";
import {AppState} from "../../stores/app.reducers";
import {GetDagRuns} from "../../stores/runs/runs.actions";
import {Subscription} from "rxjs";
import {skip} from "rxjs/operators";

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
  sort: Sort = null;
  filters: Filter[] = [];
  pageFrom: number;
  pageSize: number;

  constructor(private store: Store<AppState>) {}

  @ViewChildren(ClrDatagridColumn) columns: QueryList<ClrDatagridColumn>;

  clear() {
    this.columns.forEach(column => console.log(column.field));
    this.columns.forEach(column => column.filterValue = "");
    this.columns.forEach(column => column.sortOrder = 0);
  }

  ngAfterViewInit(): void {
    this.runsSubscription = this.store.select('runs').pipe(skip(1)).subscribe((state) => {
      this.dagRuns = state.dagRuns;
      this.total = state.total;
      this.loading = state.loading;
      this.sort = state.sort;
      this.filters = state.filters;
      this.pageFrom = state.pageFrom;
      this.pageSize = state.pageSize;
    });
  }

  ngOnDestroy(): void {
    this.runsSubscription.unsubscribe();
  }

  refresh(state: ClrDatagridStateInterface) {
    let sort: Sort = state.sort ? new Sort(<string>state.sort.by, state.sort.reverse ? -1 : 1) : null;
    if(this.sort && this.sort.by == sort.by && this.sort.order == -1 && sort.order == 1) {
      sort = null
    }

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

  refreshRefresh() {
    this.store.dispatch(new GetDagRuns({
      pageFrom: this.pageFrom,
      pageSize: this.pageSize,
      sort: this.sort,
      filters: this.filters
    }));
  }

  sortOrder(name: string): number {
    return !!this.sort && this.sort.by == name ? this.sort.order : 0;
  }

  filterOrder(name: string): string {
    // console.log('filterOrder = ' + name);
    let filter  = !!this.filters ? this.filters.find(element => element.property == name) : null;
    return !!filter ? filter.value : null;
  }

  clearFiltersAndSort(): void {
    console.log('clearFiltersAndSort');
    this.store.dispatch(new GetDagRuns({
      pageFrom: this.pageFrom,
      pageSize: this.pageSize,
      sort: null,
      filters: []
    }));
  }

}

export class Sort {
  by: string;
  order: number;

  constructor(by: string, order: number) {
    this.by = by;
    this.order = order;
  }
}

export class Filter {
  property: string;
  value: string;
}

