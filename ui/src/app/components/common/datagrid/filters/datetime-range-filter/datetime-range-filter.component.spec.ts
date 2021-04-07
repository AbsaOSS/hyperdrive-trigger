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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DatetimeRangeFilterComponent } from './datetime-range-filter.component';
import { DagRunModelFactory } from '../../../../../models/dagRuns/dagRun.model';

describe('DatetimeRangeFilterComponent', () => {
  let fixture: ComponentFixture<DatetimeRangeFilterComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DatetimeRangeFilterComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DatetimeRangeFilterComponent);
  });

  it('should create', () => {
    const underTest = fixture.componentInstance;
    expect(underTest).toBeTruthy();
  });

  describe('accepts', () => {
    it('should accept when it is in the range', () => {
      const underTest = fixture.componentInstance;
      const timeOffset = 24 * 60 * 60 * 1000;
      const today = new Date();
      const past = new Date(today.getTime() - 5 * timeOffset);
      const future = new Date(today.getTime() + 5 * timeOffset);

      underTest.value = { from: past, to: future };
      underTest.property = 'started';
      const dagRun = DagRunModelFactory.create('value', 'projectName', 2, 'Status', 'Triggered by', today, today, 0);

      expect(underTest.accepts(dagRun)).toBeTrue();
    });

    it('should accept when it is on edge of the range', () => {
      const underTest = fixture.componentInstance;
      const timeOffset = 24 * 60 * 60 * 1000;
      const today = new Date();
      const past = new Date(today.getTime() - 5 * timeOffset);
      const future = new Date(today.getTime() + 5 * timeOffset);

      underTest.value = { from: past, to: future };
      underTest.property = 'started';
      const dagRun = DagRunModelFactory.create('value', 'projectName', 2, 'Status', 'Triggered by', future, today, 0);

      expect(underTest.accepts(dagRun)).toBeTrue();
    });

    it('should not accept when it is not in the range', () => {
      const underTest = fixture.componentInstance;
      const timeOffset = 24 * 60 * 60 * 1000;
      const today = new Date();
      const past = new Date(today.getTime() - 5 * timeOffset);
      const future = new Date(today.getTime() + 5 * timeOffset);

      underTest.value = { from: past, to: past };
      underTest.property = 'started';
      const dagRun = DagRunModelFactory.create('value', 'projectName', 2, 'Status', 'Triggered by', future, today, 0);

      expect(underTest.accepts(dagRun)).toBeFalse();
    });
  });
});
