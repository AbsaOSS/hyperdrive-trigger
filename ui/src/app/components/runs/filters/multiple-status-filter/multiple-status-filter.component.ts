import {AfterViewInit, Component, Input, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {ClrDatagridFilterInterface} from '@clr/angular';
import {DagRunModel} from '../../../../models/dagRuns/dagRun.model';
import {StatusModel} from '../../../../models/status.model';
import {StringEqualsFilterAttributes} from '../../../../models/search/';

@Component({
  selector: 'app-multiple-status-filter',
  templateUrl: './multiple-status-filter.component.html',
  styleUrls: ['./multiple-status-filter.component.scss']
})
export class MultipleStatusFilterComponent implements ClrDatagridFilterInterface<DagRunModel>, AfterViewInit, OnDestroy {
  @Input() romoveFiltersSubject: Subject<any>;
  @Input() property: string;
  @Input() statuses: StatusModel[];
  actualValues: string[] = [];

  changes = new Subject<any>();

  constructor() { }

  ngAfterViewInit(): void {
    this.romoveFiltersSubject.subscribe(_ => this.onRemoveFilter());
  }

  ngOnDestroy(): void {
    this.romoveFiltersSubject.unsubscribe();
  }

  toggleStatuses(statusNames: string[]) {
    this.actualValues = this.actualValues.concat(statusNames);
    this.changes.next();
 }

 accepts(items: DagRunModel[]): boolean {
   return !!this.actualValues ? items[this.property] === this.actualValues : true;
 }

 get state() {
   return new ContainsMultipleFilterAtributes(this.property, this.actualValues);
 }

 isActive(): boolean {
   return !!this.actualValues;
 }

  onRemoveFilter() {
    this.actualValues = [];
    this.changes.next();
  }
}
