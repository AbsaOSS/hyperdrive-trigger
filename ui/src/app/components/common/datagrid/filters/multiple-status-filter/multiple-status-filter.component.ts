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

import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ClrDatagridFilterInterface } from '@clr/angular';
import { StatusModel } from '../../../../../models/status.model';
import { EqualsMultipleFilterAttributes } from '../../../../../models/search/equalsMultipleFilterAttributes.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-multiple-status-filter',
  templateUrl: './multiple-status-filter.component.html',
  styleUrls: ['./multiple-status-filter.component.scss'],
})
export class MultipleStatusFilterComponent implements ClrDatagridFilterInterface<any>, AfterViewInit, OnDestroy {
  @Input() removeFiltersSubject: Subject<any>;
  @Input() property: string;
  @Input() statuses: StatusModel[];
  selectedValues: string[] = [];
  isSelected: any = [];

  changes = new Subject<any>();

  modelChanges: Subject<any> = new Subject<any>();
  modelSubscription: Subscription;

  constructor() {
    // do nothing
  }

  ngAfterViewInit(): void {
    this.modelSubscription = this.modelChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe((newValue) => {
      this.changes.next();
    });

    this.removeFiltersSubject.subscribe((_) => this.onRemoveFilter());
  }

  ngOnDestroy(): void {
    !!this.removeFiltersSubject && this.removeFiltersSubject.unsubscribe();
    !!this.modelSubscription && this.modelSubscription.unsubscribe();
  }

  toggleStatuses(statusModel) {
    if (this.selectedValues.indexOf(statusModel.name) < 0) {
      this.selectedValues = this.selectedValues.concat(statusModel.name);
    } else {
      this.selectedValues = this.selectedValues.filter((status) => status !== statusModel.name);
    }

    this.changes.next(true);
  }

  accepts(item: any): boolean {
    if (this.selectedValues.length === 0) {
      return true;
    }
    for (const selectedStatus of this.selectedValues) {
      if (selectedStatus === item[this.property]) {
        return true;
      }
    }
    return false;
  }

  get state() {
    return new EqualsMultipleFilterAttributes(this.property, this.selectedValues);
  }

  isActive(): boolean {
    return this.selectedValues !== null && this.selectedValues.length > 0;
  }

  onRemoveFilter() {
    this.selectedValues = [];
    this.modelChanges.next(this.selectedValues);
    this.isSelected = [];
  }
}
