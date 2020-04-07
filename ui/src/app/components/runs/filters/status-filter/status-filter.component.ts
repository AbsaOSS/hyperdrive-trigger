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
import {DagRunModel} from '../../../../models/dagRuns/dagRun.model';
import {StatusModel} from '../../../../models/status.model';
import {StringEqualsFilterAttributes} from '../../../../models/search/stringEqualsFilterAttributes.model';

@Component({
  selector: 'app-status-filter',
  templateUrl: './status-filter.component.html',
  styleUrls: ['./status-filter.component.scss']
}) export class StatusFilterComponent implements ClrDatagridFilterInterface<DagRunModel>, AfterViewInit, OnDestroy {
  @Input() removeFiltersSubject: Subject<any>;
  @Input() property: string;
  @Input() statuses: StatusModel[];
  value: string = undefined;

  changes = new Subject<any>();

  constructor() {}

  ngAfterViewInit(): void {
    this.removeFiltersSubject.subscribe(_ => this.onRemoveFilter());
  }

  ngOnDestroy(): void {
    this.removeFiltersSubject.unsubscribe();
  }

  toggleStatus(statusName: string) {
    this.value = this.value === statusName ? undefined : statusName;
    this.changes.next();
  }

  accepts(item: DagRunModel): boolean {
    return !!this.value ? item[this.property] === this.value : true;
  }

  get state() {
    return new StringEqualsFilterAttributes(this.property, 54, this.value);
  }

  isActive(): boolean {
    return !!this.value;
  }

  onRemoveFilter() {
    this.value = undefined;
    this.changes.next();
  }

}
