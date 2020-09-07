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

import {AfterViewInit, Component, Input, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {ClrDatagridFilterInterface} from '@clr/angular';
import {StatusModel} from '../../../../../models/status.model';
import { ContainsFilterAttributes } from '../../../../../models/search/containsFilterAttributes.model';

@Component({
  selector: 'app-boolean-filter',
  templateUrl: './boolean-filter.component.html',
  styleUrls: ['./boolean-filter.component.scss']
}) export class BooleanFilterComponent implements ClrDatagridFilterInterface<any>, AfterViewInit, OnDestroy {
  @Input() removeFiltersSubject: Subject<any>;
  @Input() property: string;
  @Input() statuses: StatusModel[];
  @Input() value: boolean;

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

  toggleStatus(statusName: string) {
    const toBoolean = this.convertToBoolean(statusName);
    this.value = this.value == toBoolean ? undefined : toBoolean;
    console.log(this.value);
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

  convertToBoolean(input: string): boolean | undefined {
    try {
      return JSON.parse(input);
    } catch (e) {
      return undefined;
    }
  }

}
