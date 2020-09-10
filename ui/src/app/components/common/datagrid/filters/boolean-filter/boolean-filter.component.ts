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
import { Subject } from 'rxjs';
import { ClrDatagridFilterInterface } from '@clr/angular';
import { BooleanFilterAttributes } from '../../../../../models/search/booleanFilterAttributes.model';

@Component({
  selector: 'app-boolean-filter',
  templateUrl: './boolean-filter.component.html',
  styleUrls: ['./boolean-filter.component.scss'],
})
export class BooleanFilterComponent implements ClrDatagridFilterInterface<any>, AfterViewInit, OnDestroy {
  @Input() removeFiltersSubject: Subject<any>;
  @Input() property: string;
  @Input() value: { isTrue: boolean; isFalse: boolean };

  emptyValue = { isTrue: undefined, isFalse: undefined };

  changes = new Subject<any>();

  constructor() {
    // do nothing
  }

  ngAfterViewInit(): void {
    this.removeFiltersSubject.subscribe((_) => this.onRemoveFilter());
  }

  ngOnDestroy(): void {
    !!this.removeFiltersSubject && this.removeFiltersSubject.unsubscribe();
  }

  toggleTrue() {
    this.value = { ...this.value, isTrue: !!this.value?.isTrue ? !this.value.isTrue : true };
    this.changes.next();
  }

  toggleFalse() {
    this.value = { ...this.value, isFalse: !!this.value?.isFalse ? !this.value.isFalse : true };
    this.changes.next();
  }

  accepts(item: any): boolean {
    const testedValue = item[this.property];

    return (this.value.isTrue && testedValue == true) || (this.value.isFalse && testedValue == false);
  }

  get state() {
    return new BooleanFilterAttributes(this.property, this.value);
  }

  isActive(): boolean {
    return !!this.value?.isTrue || !!this.value?.isFalse;
  }

  onRemoveFilter() {
    this.value = this.emptyValue;
    this.changes.next();
  }
}
