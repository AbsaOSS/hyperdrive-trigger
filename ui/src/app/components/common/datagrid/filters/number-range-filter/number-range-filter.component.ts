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

import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ClrDatagridFilterInterface } from '@clr/angular';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IntRangeFilterAttributes } from '../../../../../models/search/intRangeFilterAttributes.model';

@Component({
  selector: 'app-number-range-filter',
  templateUrl: './number-range-filter.component.html',
  styleUrls: ['./number-range-filter.component.scss'],
})
export class NumberRangeFilterComponent implements ClrDatagridFilterInterface<any>, AfterViewInit {
  @Input() removeFiltersSubject: Subject<any>;
  @Input() property: string;
  value: { from: number; to: number } = { from: undefined, to: undefined };

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
    const state: number = item[this.property];

    const left: boolean = !!this.value.from ? this.value.from <= state : true;
    const right: boolean = !!this.value.to ? this.value.to >= state : true;

    return left && right;
  }

  isActive(): boolean {
    return !!this.value.from || !!this.value.to;
  }

  get state() {
    return new IntRangeFilterAttributes(this.property, this.value.from, this.value.to);
  }

  modelChanged(value: string) {
    this.modelChanges.next(value);
  }

  onRemoveFilter() {
    this.value = { from: undefined, to: undefined };
    this.modelChanges.next(this.value);
  }
}
