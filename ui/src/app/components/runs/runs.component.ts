import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {DagRunModel} from "../../models/dagRun.model";
import {ClrDatagridStateInterface} from "@clr/angular";
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

  refresh(state: ClrDatagridStateInterface) {
    let sort: Sort = <Sort> state.sort;
    let filters: Filter[] = state.filters ? state.filters.map(filter => <Filter> filter) : [];

    this.store.dispatch(new GetDagRuns({
      pageFrom: state.page.from < 0 ? 0 : state.page.from,
      pageSize: state.page.size,
      sort: sort,
      filters:  filters
    }));
  }

}

export class Sort {
   by: string;
   reverse: boolean;
}

export class Filter {
  property: string;
  value: string;
}

