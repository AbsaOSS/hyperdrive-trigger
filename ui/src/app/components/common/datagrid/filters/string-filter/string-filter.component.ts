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
import { ClrDatagridFilterInterface } from '@clr/angular';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ContainsFilterAttributes } from '../../../../../models/search/containsFilterAttributes.model';

@Component({
  selector: 'app-string-filter',
  templateUrl: './string-filter.component.html',
  styleUrls: ['./string-filter.component.scss'],
})
export class StringFilterComponent implements ClrDatagridFilterInterface<any>, AfterViewInit, OnDestroy {
  @Input() removeFiltersSubject: Subject<any>;
  @Input() property: string;
  @Input() value: string = undefined;

  //clarity interface
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

  isActive(): boolean {
    return !!this.value;
  }

  accepts(item: any): boolean {
    const state: string = item[this.property];
    return (!state && !item) || state.includes(this.value);
  }

  get state() {
    return new ContainsFilterAttributes(this.property, this.value);
  }

  modelChanged(value: string) {
    this.modelChanges.next(value);
  }

  onRemoveFilter() {
    this.value = undefined;
    this.modelChanges.next(this.value);
  }
}
