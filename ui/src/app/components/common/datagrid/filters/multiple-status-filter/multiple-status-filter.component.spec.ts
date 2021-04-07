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

import { MultipleStatusFilterComponent } from './multiple-status-filter.component';
import { DagRunModelFactory } from '../../../../../models/dagRuns/dagRun.model';

describe('MultipleStatusFilterComponent', () => {
  let fixture: ComponentFixture<MultipleStatusFilterComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [MultipleStatusFilterComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleStatusFilterComponent);
  });

  it('should create', () => {
    const underTest = fixture.componentInstance;
    expect(underTest).toBeTruthy();
  });

  describe('accepts', () => {
    it('should accept on exact matches', () => {
      const underTest = fixture.componentInstance;
      underTest.selectedValues = ['Failed', 'Running'];
      underTest.property = 'status';
      const dagRun = DagRunModelFactory.create(
        'workflowName',
        'projectName',
        8,
        'Failed',
        'Triggered by',
        new Date(Date.now()),
        new Date(Date.now()),
        0,
      );

      expect(underTest.accepts(dagRun)).toBeTrue();
    });

    it('should not accept on partial match', () => {
      const underTest = fixture.componentInstance;
      underTest.selectedValues = ['Failed', 'Running'];
      underTest.property = 'status';
      const dagRun = DagRunModelFactory.create(
        'workflowName',
        'projectName',
        8,
        'Fail',
        'Triggered by',
        new Date(Date.now()),
        new Date(Date.now()),
        0,
      );

      expect(underTest.accepts(dagRun)).toBeFalse();
    });

    it('should not accept on no match', () => {
      const underTest = fixture.componentInstance;
      underTest.selectedValues = ['Failed', 'Running'];
      underTest.property = 'status';
      const dagRun = DagRunModelFactory.create(
        'workflowName',
        'projectName',
        8,
        'differentStatus',
        'Triggered by',
        new Date(Date.now()),
        new Date(Date.now()),
        0,
      );

      expect(underTest.accepts(dagRun)).toBeFalse();
    });

    it('should accept on empty selected status', () => {
      const underTest = fixture.componentInstance;
      underTest.selectedValues = [];
      underTest.property = 'status';
      const dagRun = DagRunModelFactory.create(
        'workflowName',
        'projectName',
        8,
        'Failed',
        'Triggered by',
        new Date(Date.now()),
        new Date(Date.now()),
        0,
      );

      expect(underTest.accepts(dagRun)).toBeTrue();
    });
  });
});
