import {AfterViewInit, Component, Input, OnDestroy} from '@angular/core';
import {Subject} from "rxjs";
import {ClrDatagridFilterInterface} from "@clr/angular";
import {DagRunModel} from "../../../../models/dagRuns/dagRun.model";
import {StatusModel} from "../../../../models/status.model";

@Component({
  selector: 'app-status-filter',
  templateUrl: './status-filter.component.html',
  styleUrls: ['./status-filter.component.scss']
}) export class StatusFilterComponent implements ClrDatagridFilterInterface<DagRunModel>, AfterViewInit, OnDestroy {
  @Input() removeFiltersSubject: Subject<any>;
  @Input() property: string;
  @Input() statuses: StatusModel[];
  value: string = undefined;

  changes = new Subject<any>();

  constructor() { }

  ngAfterViewInit(): void {
    this.removeFiltersSubject.subscribe(_ => this.onRemoveFilter());
  }

  ngOnDestroy(): void {
    this.removeFiltersSubject.unsubscribe();
  }

  toggleStatus(statusName: string) {
    this.value = this.value == statusName ? undefined : statusName;
    this.changes.next();
  }

  accepts(item: DagRunModel): boolean {
    return !!this.value ? item[this.property] == this.value : true;
  }

  isActive(): boolean {
    return !!this.value;
  }

  onRemoveFilter() {
    this.value = undefined;
    this.changes.next();
  }

}
