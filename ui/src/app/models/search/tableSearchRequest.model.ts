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

import { ContainsFilterAttributes } from './containsFilterAttributes.model';
import { IntRangeFilterAttributes } from './intRangeFilterAttributes.model';
import { DateTimeRangeFilterAttributes } from './dateTimeRangeFilterAttributes.model';
import { SortAttributesModel } from './sortAttributes.model';
import { EqualsMultipleFilterAttributes } from './equalsMultipleFilterAttributes.model';
import { LongFilterAttributes } from './longFilterAttributes.model';
import { BooleanFilterAttributes } from './booleanFilterAttributes.model';
import { FilterAttributes } from './filterAttributes.model';

export class TableSearchRequestModel {
  constructor(
    public from: number,
    public size: number,
    public containsFilterAttributes?: ContainsFilterAttributes[],
    public intRangeFilterAttributes?: IntRangeFilterAttributes[],
    public dateTimeRangeFilterAttributes?: DateTimeRangeFilterAttributes[],
    public longFilterAttributes?: LongFilterAttributes[],
    public equalsMultipleFilterAttributes?: EqualsMultipleFilterAttributes[],
    public booleanFilterAttributes?: BooleanFilterAttributes[],
    public sort?: SortAttributesModel,
  ) {}
}

export class TableSearchRequestModelFactory {
  static create(from: number, size: number, sort?: SortAttributesModel, filters?: FilterAttributes[]): TableSearchRequestModel {
    return {
      from: from,
      size: size,
      sort: sort,
      containsFilterAttributes: filters?.filter((f) => f instanceof ContainsFilterAttributes).map((f) => f as ContainsFilterAttributes),
      intRangeFilterAttributes: filters?.filter((f) => f instanceof IntRangeFilterAttributes).map((f) => f as IntRangeFilterAttributes),
      dateTimeRangeFilterAttributes: filters
        ?.filter((f) => f instanceof DateTimeRangeFilterAttributes)
        .map((f) => f as DateTimeRangeFilterAttributes),
      longFilterAttributes: filters?.filter((f) => f instanceof LongFilterAttributes).map((f) => f as LongFilterAttributes),
      equalsMultipleFilterAttributes: filters
        ?.filter((f) => f instanceof EqualsMultipleFilterAttributes)
        .map((f) => f as EqualsMultipleFilterAttributes),
      booleanFilterAttributes: filters?.filter((f) => f instanceof BooleanFilterAttributes).map((f) => f as BooleanFilterAttributes),
    };
  }
}
