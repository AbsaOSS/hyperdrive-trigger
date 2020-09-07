import {AfterViewInit, Component, Input, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {ClrDatagridFilterInterface} from '@clr/angular';
import {StatusModel} from '../../../../../models/status.model';
import { ContainsFilterAttributes } from '../../../../../models/search/containsFilterAttributes.model';

@Component({
  selector: 'app-status-filter',
  templateUrl: './status-filter.component.html',
  styleUrls: ['./status-filter.component.scss']
}) export class StatusFilterComponent implements ClrDatagridFilterInterface<any>, AfterViewInit, OnDestroy {
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

  accepts(item: any): boolean {
    return !!this.value ? item[this.property] == this.value : true;
  }

  isActive(): boolean {
    return !!this.value;
  }

  get state() {
    return new ContainsFilterAttributes(this.property, this.value);
  }

  onRemoveFilter() {
    this.value = undefined;
    this.changes.next();
  }

}