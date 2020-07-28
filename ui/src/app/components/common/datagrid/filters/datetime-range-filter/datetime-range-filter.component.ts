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

import { AfterViewInit, Component, Input } from '@angular/core';
import { ClrDatagridFilterInterface } from '@clr/angular';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DateTimeRangeFilterAttributes } from '../../../../../models/search/dateTimeRangeFilterAttributes.model';

@Component({
  selector: 'app-datetime-range-filter',
  templateUrl: './datetime-range-filter.component.html',
  styleUrls: ['./datetime-range-filter.component.scss'],
})
export class DatetimeRangeFilterComponent implements ClrDatagridFilterInterface<any>, AfterViewInit {
  @Input() removeFiltersSubject: Subject<any>;
  @Input() property: string;
  value: { from: Date; to: Date } = { from: undefined, to: undefined };

  //clarity interface
  changes: Subject<any> = new Subject<any>();

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

  accepts(item: any): boolean {
    const state: Date = item[this.property];

    const left: boolean = !!this.value.from ? this.value.from <= state : true;
    const right: boolean = !!this.value.to ? this.value.to >= state : true;

    return left && right;
  }

  isActive(): boolean {
    return !!this.value.from || !!this.value.to;
  }

  get state() {
    return new DateTimeRangeFilterAttributes(this.property, this.value.from, this.value.to);
  }

  modelChanged(value: Date) {
    !!this.value.from ? this.value.from.setHours(0, 0, 0, 0) : undefined;
    !!this.value.to ? this.value.to.setHours(23, 59, 59, 59) : undefined;
    this.modelChanges.next(value);
  }

  onRemoveFilter() {
    this.value = { from: undefined, to: undefined };
    this.modelChanges.next(this.value);
  }
}
