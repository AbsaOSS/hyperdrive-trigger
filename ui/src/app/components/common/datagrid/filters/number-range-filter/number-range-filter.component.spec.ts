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

import { NumberRangeFilterComponent } from './number-range-filter.component';
import { DagRunModelFactory } from '../../../../../models/dagRuns/dagRun.model';

describe('NumberRangeFilterComponent', () => {
  let fixture: ComponentFixture<NumberRangeFilterComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [NumberRangeFilterComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberRangeFilterComponent);
  });

  it('should create', () => {
    const underTest = fixture.componentInstance;
    expect(underTest).toBeTruthy();
  });

  describe('accepts', () => {
    it('should accept when it is in the range', () => {
      const underTest = fixture.componentInstance;
      underTest.value = { from: 1, to: 3 };
      underTest.property = 'jobCount';
      const dagRun = DagRunModelFactory.create(
        'value',
        'projectName',
        2,
        'Status',
        'Triggered by',
        new Date(Date.now()),
        new Date(Date.now()),
        0,
      );

      expect(underTest.accepts(dagRun)).toBeTrue();
    });

    it('should accept when it is on left edge of the range', () => {
      const underTest = fixture.componentInstance;
      underTest.value = { from: 1, to: 2 };
      underTest.property = 'jobCount';
      const dagRun = DagRunModelFactory.create(
        'value',
        'projectName',
        1,
        'Status',
        'Triggered by',
        new Date(Date.now()),
        new Date(Date.now()),
        0,
      );

      expect(underTest.accepts(dagRun)).toBeTrue();
    });

    it('should accept when it is on right edge of the range', () => {
      const underTest = fixture.componentInstance;
      underTest.value = { from: 1, to: 2 };
      underTest.property = 'jobCount';
      const dagRun = DagRunModelFactory.create(
        'value',
        'projectName',
        2,
        'Status',
        'Triggered by',
        new Date(Date.now()),
        new Date(Date.now()),
        0,
      );

      expect(underTest.accepts(dagRun)).toBeTrue();
    });

    it('should not accept when it is not in the range', () => {
      const underTest = fixture.componentInstance;
      underTest.value = { from: 5, to: 8 };
      underTest.property = 'jobCount';
      const dagRun = DagRunModelFactory.create(
        'value',
        'projectName',
        2,
        'Status',
        'Triggered by',
        new Date(Date.now()),
        new Date(Date.now()),
        0,
      );

      expect(underTest.accepts(dagRun)).toBeFalse();
    });
  });
});
