import {
  AfterViewInit,
  Component, ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {DagRunModel} from "../../models/dagRun.model";
import {
  ClrDatagrid,
  ClrDatagridColumn,
  ClrDatagridFilterInterface,
  ClrDatagridSortOrder,
  ClrDatagridStateInterface
} from "@clr/angular";
import {Store} from "@ngrx/store";
import {AppState} from "../../stores/app.reducers";
import {GetDagRuns} from "../../stores/runs/runs.actions";
import {Subject, Subscription} from "rxjs";
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

  state: ClrDatagridStateInterface;

  constructor(private store: Store<AppState>) {}

  ngAfterViewInit(): void {
    this.runsSubscription = this.store.select('runs').pipe(skip(1)).subscribe((state) => {
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
