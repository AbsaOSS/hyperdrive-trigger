import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit} from '@angular/core';
import {ClrDatagridFilterInterface} from "@clr/angular";
import {Observable, Subject, Subscription} from "rxjs";
import {DagRunModel} from "../../../../models/dagRuns/dagRun.model";
import {Store} from "@ngrx/store";
import {AppState, selectRunState} from "../../../../stores/app.reducers";
import {debounce, debounceTime, distinctUntilChanged, skip} from "rxjs/operators";
import {GetDagRuns, SetFilter} from "../../../../stores/runs/runs.actions";

@Component({
  selector: 'app-string-filter',
  templateUrl: './string-filter.component.html',
  styleUrls: ['./string-filter.component.scss']
})
export class StringFilterComponent implements ClrDatagridFilterInterface<DagRunModel> , AfterViewInit{
  @Input() property: string;
  value: string = undefined;

  //clarity interface
  changes = new Subject<any>();
  //angular
  modelChanged: Subject<string> = new Subject<string>();
  //ngrx
  subscription: Subscription;

  constructor(private store: Store<AppState>) {
    this.modelChanged.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(model => {
      console.log('model changed');
      this.value = model;
      this.store.dispatch(new SetFilter({property: this.property, value: this.value}));
      this.changes.next();
    });
  }

  ngAfterViewInit(): void {
    this.subscription = this.store.select(selectRunState).pipe(skip(1)).subscribe((state) => {
      let newValue = state.filters[this.property];
      if(newValue != this.value) {
        this.value = newValue;
        this.changes.next();
      }
    });
  }

  isActive(): boolean {
    return !!this.value
  }

  accepts(value: DagRunModel): boolean {
    const state: string = value[this.property];
    return (!state && !value) || state.includes(this.value);
  }

  changed(text: string) {
    this.modelChanged.next(text);
  }

  onRemove() {
    this.modelChanged.next(undefined)
  }

}
