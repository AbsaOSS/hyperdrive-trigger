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
import { EqualsMultipleFilterAttributes } from '../../../../../models/search/equalsMultipleFilterAttributes.model';

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

  constructor() {
    // do nothing
  }

  ngAfterViewInit(): void {
    this.changes.next();
    this.removeFiltersSubject.subscribe((_) => this.onRemoveFilter());
  }

  ngOnDestroy(): void {
    !!this.removeFiltersSubject && this.removeFiltersSubject.unsubscribe();
  }

  toggleTrue() {
    this.changes.next(true);
  }

  toggleFalse() {
    this.changes.next(true);
  }

  accepts(item: any): boolean {
    const testedValue = item[this.property];

    return (this.isTrueSelected && testedValue == true) || (this.isFalseSelected && testedValue == false);
  }

  get state() {
    const values: string[] = [];
    return new EqualsMultipleFilterAttributes(this.property, values);
    /* only a placeholder implementation to avoid runtime errors.
       But backend-filtering functionality is not available for this filter.
    */
  }

  isActive(): boolean {
    return this.isTrueSelected || this.isFalseSelected;
  }

  onRemoveFilter() {
    this.isTrueSelected = false;
    this.isFalseSelected = false;
    this.modelChanges.next();
  }
}
