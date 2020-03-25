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

import {ContainsFilterAttributes} from '../filters/containsFilterAttributes.model';

export class DagRunsSearchRequestModel {
  constructor(
    public from: number,
    public size: number,
    public containsFilterAttributes?: ContainsFilterAttributes[],
    public rangeFilters?: RangeFiltersModel,
    public sort?: SortModel
  ) {}
}

export class SortModel {
  constructor(public by: String, public order: number) {}
}

export class RangeFiltersModel {
  byJobCount?: IntRangeModel;
  byStartedDate?: DateTimeRangeModel;
  byFinishedDate?: DateTimeRangeModel;
}

export class IntRangeModel {
  start: number;
  end: number;
}

export class DateTimeRangeModel {
  start: Date;
  end: Date;
}
