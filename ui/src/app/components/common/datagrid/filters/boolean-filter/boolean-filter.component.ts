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
import { EqualsMultipleFilterAttributes } from '../../../../../models/search/equalsMultipleFilterAttributes.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-boolean-filter',
  templateUrl: './boolean-filter.component.html',
  styleUrls: ['./boolean-filter.component.scss'],
})
export class BooleanFilterComponent implements ClrDatagridFilterInterface<any>, AfterViewInit, OnDestroy {
  @Input() removeFiltersSubject: Subject<any>;
  @Input() property: string;
  @Input() value;
  isTrueSelected = false;
  isFalseSelected = false;

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

  toggleTrue() {
    this.changes.next(true);
  }

  toggleFalse() {
    this.changes.next(true);
  }

  accepts(item: any): boolean {
    const testedValue = item[this.property];

    if (this.isTrueSelected && testedValue == true) {
      return true;
    }

    if (this.isFalseSelected && testedValue == false) {
      return true;
    }

    return false;
  }

  get state() {
    const values: string[] = [];
    return new EqualsMultipleFilterAttributes(this.property, values);
  }

  isActive(): boolean {
    return this.isTrueSelected || this.isFalseSelected;
  }

  onRemoveFilter() {
    this.isTrueSelected = false;
    this.isFalseSelected = false;
    this.modelChanges.next([]);
  }
}
